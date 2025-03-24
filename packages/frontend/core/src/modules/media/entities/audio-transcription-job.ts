import { shallowEqual } from '@affine/component';
import { DebugLogger } from '@affine/debug';
import { UserFriendlyError } from '@affine/error';
import {
  AiJobStatus,
  claimAudioTranscriptionMutation,
  getAudioTranscriptionByBlobIdQuery,
  getAudioTranscriptionQuery,
  submitAudioTranscriptionMutation,
} from '@affine/graphql';
import type { TranscriptionBlockProps } from '@blocksuite/affine/model';
import { Entity, LiveData } from '@toeverything/infra';

import { AuthService } from '../../cloud/services/auth';
import { GraphQLService } from '../../cloud/services/graphql';
import { ServersService } from '../../cloud/services/servers';
import type { GlobalContextService } from '../../global-context';
import type { TranscriptionResult } from './types';

// The UI status of the transcription job
export type TranscriptionStatus =
  | {
      status: 'no-job';
    }
  | {
      status: 'started';
    }
  | {
      status: 'submitted-by-other-user';
      userId: string; // the user id of the user who submitted the job
    }
  | {
      status: AiJobStatus.pending;
    }
  | {
      status: AiJobStatus.running;
    }
  | {
      status: AiJobStatus.failed;
      error: UserFriendlyError; // <<- this is not visible on UI yet
    }
  | {
      status: AiJobStatus.finished; // ready to be claimed, but may be rejected because of insufficient credits
    }
  | {
      status: AiJobStatus.claimed;
      result: TranscriptionResult;
    };

const logger = new DebugLogger('audio-transcription-job');

export class AudioTranscriptionJob extends Entity<{
  readonly blockProps: TranscriptionBlockProps;
  readonly blobId: string;
  readonly getAudioFile: () => Promise<File>;
}> {
  constructor(private readonly globalContextService: GlobalContextService) {
    super();
    this.disposables.push(() => {
      this.disposed = true;
    });
  }

  disposed = false;

  private readonly _status$ = new LiveData<TranscriptionStatus>({
    status: 'no-job',
  });

  status$ = this._status$.distinctUntilChanged(shallowEqual);

  async start() {
    if (this.disposed) {
      logger.debug('Job already disposed, cannot start');
      throw new Error('Job already disposed');
    }

    if (!this.currentUserId) {
      logger.debug('No current user id available');
      throw new Error('No current user id');
    }

    this._status$.value = {
      status: 'started',
    };

    if (
      this.props.blockProps.jobId &&
      this.props.blockProps.createdBy &&
      this.props.blockProps.createdBy !== this.currentUserId
    ) {
      logger.debug('Job was submitted by another user', {
        submittedBy: this.props.blockProps.createdBy,
        currentUser: this.currentUserId,
      });
      this._status$.value = {
        status: 'submitted-by-other-user',
        userId: this.props.blockProps.createdBy,
      };
      return;
    }

    try {
      // firstly check if there is a job already
      logger.debug('Checking for existing transcription job for blob', {
        blobId: this.props.blobId,
      });
      let job: {
        id: string;
        status: AiJobStatus;
      } | null = this.props.blockProps.jobId
        ? await this.fetchers.getAudioTranscription(this.props.blockProps.jobId)
        : await this.fetchers.getAudioTranscriptionByBlobId();

      if (!job) {
        logger.debug('No existing job found, submitting new transcription job');
        job = await this.fetchers.submitAudioTranscription();
      } else {
        logger.debug('Found existing job', {
          jobId: job.id,
          status: job.status,
        });
      }

      this.props.blockProps.jobId = job.id;
      this.props.blockProps.createdBy = this.currentUserId;

      if (job.status !== AiJobStatus.failed) {
        this._status$.value = {
          status: AiJobStatus.pending,
        };
      } else {
        logger.debug('Job submission failed');
        throw UserFriendlyError.fromAny('failed to submit transcription');
      }
    } catch (err) {
      logger.debug('Error during job submission', { error: err });
      this._status$.value = {
        status: AiJobStatus.failed,
        error: UserFriendlyError.fromAny(err),
      };
    }

    await this.untilJobClaimed();
  }

  private async untilJobClaimed(): Promise<boolean> {
    while (
      !this.disposed &&
      this.props.blockProps.jobId &&
      this.props.blockProps.createdBy === this.currentUserId
    ) {
      try {
        logger.debug('Polling job status', {
          jobId: this.props.blockProps.jobId,
        });
        const job = await this.fetchers.getAudioTranscription(
          this.props.blockProps.jobId
        );

        if (!job || job?.status === 'failed') {
          logger.debug('Job failed during polling', {
            jobId: this.props.blockProps.jobId,
          });
          throw UserFriendlyError.fromAny('Transcription job failed');
        }

        if (job?.status === 'finished') {
          logger.debug('Job finished, ready to claim', {
            jobId: this.props.blockProps.jobId,
          });
          this._status$.value = {
            status: AiJobStatus.finished,
          };
        }

        if (job?.status === 'claimed' || job?.status === 'finished') {
          logger.debug('Attempting to claim job', {
            jobId: this.props.blockProps.jobId,
          });
          const claimedJob = await this.fetchers.claimAudioTranscription(
            this.props.blockProps.jobId
          );

          if (claimedJob) {
            logger.debug('Successfully claimed job', {
              jobId: this.props.blockProps.jobId,
            });
            const result: TranscriptionResult = {
              summary: claimedJob.summary ?? '',
              segments:
                claimedJob.transcription?.map(segment => ({
                  speaker: segment.speaker,
                  start: segment.start,
                  end: segment.end,
                  transcription: segment.transcription,
                })) ?? [],
            };

            this._status$.value = {
              status: AiJobStatus.claimed,
              result,
            };
            return true;
          } else {
            logger.debug('Failed to claim job', {
              jobId: this.props.blockProps.jobId,
            });
            this._status$.value = {
              status: AiJobStatus.failed,
              error: UserFriendlyError.fromAny('Failed to claim transcription'),
            };
          }
        }

        // Add delay between polling attempts
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        logger.debug('Error during job polling', {
          jobId: this.props.blockProps.jobId,
          error,
        });
        this._status$.value = {
          status: AiJobStatus.failed,
          error: UserFriendlyError.fromAny(error),
        };
        return false;
      }
    }
    return false;
  }

  isCreator() {
    return this.props.blockProps.createdBy === this.currentUserId;
  }

  private get serverService() {
    // server scope is not available in the entity
    // here is a workaround to get the server service
    const serverService = this.framework.get(ServersService);
    const currentServerId = this.globalContext.serverId.get();
    if (!currentServerId) {
      return;
    }
    return serverService.server$(currentServerId).value;
  }

  private get graphqlService() {
    return this.serverService?.scope.get(GraphQLService);
  }

  private get globalContext() {
    return this.globalContextService.globalContext;
  }

  private get currentWorkspaceId() {
    return this.globalContext.workspaceId.get();
  }

  private get currentUserId() {
    const authService = this.serverService?.scope.get(AuthService);
    if (!authService) {
      throw new Error('No auth service available');
    }
    return authService.session.account$.value?.id;
  }

  private readonly fetchers = {
    submitAudioTranscription: async () => {
      const graphqlService = this.graphqlService;
      if (!graphqlService) {
        throw new Error('No graphql service available');
      }
      const currentWorkspaceId = this.currentWorkspaceId;
      if (!currentWorkspaceId) {
        throw new Error('No current workspace id');
      }
      const file = await this.props.getAudioFile();
      const response = await graphqlService.gql({
        query: submitAudioTranscriptionMutation,
        variables: {
          workspaceId: currentWorkspaceId,
          blobId: this.props.blobId,
          blob: file,
        },
      });
      if (!response.submitAudioTranscription?.id) {
        throw new Error('Failed to submit audio transcription');
      }
      return response.submitAudioTranscription;
    },
    getAudioTranscription: async (jobId: string) => {
      const graphqlService = this.graphqlService;
      if (!graphqlService) {
        throw new Error('No graphql service available');
      }
      const currentWorkspaceId = this.currentWorkspaceId;
      if (!currentWorkspaceId) {
        throw new Error('No current workspace id');
      }
      const response = await graphqlService.gql({
        query: getAudioTranscriptionQuery,
        variables: {
          workspaceId: currentWorkspaceId,
          jobId,
        },
      });
      if (!response.currentUser?.copilot?.audioTranscription) {
        return null;
      }
      return response.currentUser.copilot.audioTranscription;
    },
    getAudioTranscriptionByBlobId: async () => {
      const graphqlService = this.graphqlService;
      if (!graphqlService) {
        throw new Error('No graphql service available');
      }
      const currentWorkspaceId = this.currentWorkspaceId;
      if (!currentWorkspaceId) {
        throw new Error('No current workspace id');
      }
      const response = await graphqlService.gql({
        query: getAudioTranscriptionByBlobIdQuery,
        variables: {
          workspaceId: currentWorkspaceId,
          blobId: this.props.blobId,
        },
      });
      if (!response.currentUser?.copilot?.audioTranscriptionByBlobId) {
        return null;
      }
      return response.currentUser.copilot.audioTranscriptionByBlobId;
    },
    claimAudioTranscription: async (jobId: string) => {
      const graphqlService = this.graphqlService;
      if (!graphqlService) {
        throw new Error('No graphql service available');
      }
      const response = await graphqlService.gql({
        query: claimAudioTranscriptionMutation,
        variables: {
          jobId,
        },
      });
      if (!response.claimAudioTranscription) {
        throw new Error('Failed to claim transcription result');
      }
      return response.claimAudioTranscription;
    },
  };
}
