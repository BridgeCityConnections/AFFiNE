import { z } from 'zod';

import { defineModuleConfig } from '../../base';

declare global {
  interface AppConfig {
    docService: {
      endpoint: string;
    };
  }
}

defineModuleConfig('docService', {
  endpoint: {
    desc: 'The endpoint of the doc service.',
    shape: z.string().url(),
  },
});
