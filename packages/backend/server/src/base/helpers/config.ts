import { defineModuleConfig } from '../config';

declare global {
  interface AppConfig {
    crypto: {
      privateKey: string | undefined;
    };
  }
}

defineModuleConfig('crypto', {
  privateKey: {
    desc: 'The private key for used by the crypto module to create signed tokens or encrypt data.',
    env: 'AFFINE_PRIVATE_KEY',
  },
});
