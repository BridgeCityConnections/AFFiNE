import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { defineModuleConfig } from '../../base';

declare global {
  interface AppConfig {
    mailer: {
      enabled: boolean;
      SMTP: ConfigItem<SMTPTransport.Options>;
    };
  }
}

defineModuleConfig('mailer', {
  enabled: {
    desc: 'Whether enabled mail service.',
    default: false,
  },
  SMTP: {
    desc: 'The SMTP configuration for the mail service.',
    link: 'https://nodemailer.com/smtp/',
    default: {},
  },
});
