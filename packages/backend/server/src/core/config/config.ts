import { defineModuleConfig } from '../../base';

export interface ServerFlags {
  earlyAccessControl: boolean;
}

declare global {
  interface AppConfig {
    flags: ServerFlags;
  }
}

defineModuleConfig('flags', {
  earlyAccessControl: {
    desc: 'Only allow users with early access features to access the app',
    default: false,
  },
});
