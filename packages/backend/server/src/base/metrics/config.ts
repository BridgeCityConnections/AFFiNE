import { defineModuleConfig } from '../config';

declare global {
  interface AppConfig {
    metrics: {
      enabled: boolean;
      // TODO(@forehalo): move to `plugins`
      customerIo: {
        token: string;
      };
    };
  }
}

defineModuleConfig('metrics', {
  enabled: {
    desc: 'Enable metric and tracing collection',
    default: false,
  },
  'customerIo.token': {
    desc: 'Customer.io token',
    env: 'CUSTOMER_IO_TOKEN',
  },
});
