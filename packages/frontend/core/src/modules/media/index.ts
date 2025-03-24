import type { Framework } from '@toeverything/infra';

import { DesktopApiService } from '../desktop-api';
import { GlobalContextService } from '../global-context';
import { GlobalState } from '../storage';
import { WorkbenchService } from '../workbench';
import { WorkspaceScope, WorkspaceService } from '../workspace';
import { AudioAttachmentBlock } from './entities/audio-attachment-block';
import { AudioMedia } from './entities/audio-media';
import { AudioTranscriptionJob } from './entities/audio-transcription-job';
import {
  ElectronGlobalMediaStateProvider,
  GlobalMediaStateProvider,
  WebGlobalMediaStateProvider,
} from './providers/global-audio-state';
import { AudioAttachmentService } from './services/audio-attachment';
import { AudioMediaManagerService } from './services/audio-media-manager';

export function configureMediaModule(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .entity(AudioMedia, [WorkspaceService])
    .entity(AudioAttachmentBlock, [AudioMediaManagerService])
    .entity(AudioTranscriptionJob, [GlobalContextService])
    .service(AudioAttachmentService);

  if (BUILD_CONFIG.isElectron) {
    framework
      .impl(GlobalMediaStateProvider, ElectronGlobalMediaStateProvider, [
        GlobalState,
      ])
      .scope(WorkspaceScope)
      .service(AudioMediaManagerService, [
        GlobalMediaStateProvider,
        WorkbenchService,
        DesktopApiService,
      ]);
  } else {
    framework
      .impl(GlobalMediaStateProvider, WebGlobalMediaStateProvider)
      .scope(WorkspaceScope)
      .service(AudioMediaManagerService, [
        GlobalMediaStateProvider,
        WorkbenchService,
      ]);
  }
}

export { AudioMedia, AudioMediaManagerService };
