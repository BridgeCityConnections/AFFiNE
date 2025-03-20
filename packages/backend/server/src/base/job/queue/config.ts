import { QueueOptions, WorkerOptions } from 'bullmq';

import { defineModuleConfig } from '../../config';
import { Queue } from './def';

declare global {
  interface AppConfig {
    job: {
      queue: ConfigItem<Omit<QueueOptions, 'connection' | 'telemetry'>>;
      worker: ConfigItem<{
        defaultWorkerOptions: Omit<WorkerOptions, 'connection' | 'telemetry'>;
      }>;
      queues: {
        [key in Queue]: ConfigItem<Omit<WorkerOptions, 'connection'>>;
      };
    };
  }
}

defineModuleConfig('job', {
  queue: {
    desc: 'The config for job queues',
    default: {
      prefix: 'affine_job',
      defaultJobOptions: {
        attempts: 5,
        // should remove job after it's completed, because we will add a new job with the same job id
        removeOnComplete: true,
        removeOnFail: {
          age: 24 * 3600 /* 1 day */,
          count: 500,
        },
      },
    },
  },

  worker: {
    desc: 'The config for job workers',
    default: {
      defaultWorkerOptions: {},
    },
  },

  'queues.copilot': {
    desc: 'The config for copilot job queue',
    default: {
      concurrency: 1,
    },
  },

  'queues.doc': {
    desc: 'The config for doc job queue',
    default: {
      concurrency: 1,
    },
  },

  'queues.notification': {
    desc: 'The config for notification job queue',
    default: {
      concurrency: 10,
    },
  },

  'queues.nightly': {
    desc: 'The config for nightly job queue',
    default: {
      concurrency: 1,
    },
  },
});
