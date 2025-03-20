import { defineModuleConfig } from '../config';

declare global {
  interface AppConfig {
    server: {
      externalUrl: string;
      https: boolean;
      host: string;
      port: number;
      path: string;
      name: string | undefined;
    };
  }
}

defineModuleConfig('server', {
  name: {
    desc: 'A recognizable name for the server. Will be shown when connected with AFFiNE Desktop.',
  },
  externalUrl: {
    desc: `Base url of AFFiNE server, used for generating external urls.
Default to be \`[server.protocol]://[server.host][:server.port]\` if not specified.
    `,
    env: 'AFFINE_SERVER_EXTERNAL_URL',
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  },
  https: {
    desc: 'Whether the server is hosted on a ssl enabled domain (https://).',
    default: false,
    env: ['AFFINE_SERVER_HTTPS', 'boolean'],
  },
  host: {
    desc: 'Where the server get deployed(FQDN).',
    default: 'localhost',
    env: 'AFFINE_SERVER_HOST',
  },
  port: {
    desc: 'Which port the server will listen on.',
    default: 3010,
    env: ['AFFINE_SERVER_PORT', 'int'],
  },
  path: {
    desc: 'Subpath where the server get deployed if there is.',
    default: '',
    env: 'AFFINE_SERVER_SUB_PATH',
  },
});
