import { defineModuleConfig } from '../../base';

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  args?: Record<string, string>;
}

export type OIDCArgs = {
  scope?: string;
  claim_id?: string;
  claim_email?: string;
  claim_name?: string;
};

export interface OAuthOIDCProviderConfig extends OAuthProviderConfig {
  issuer: string;
  args?: OIDCArgs;
}

export enum OAuthProviderName {
  Google = 'google',
  GitHub = 'github',
  OIDC = 'oidc',
}
declare global {
  interface AppConfig {
    oauth: {
      providers: {
        [OAuthProviderName.Google]: ConfigItem<OAuthProviderConfig>;
        [OAuthProviderName.GitHub]: ConfigItem<OAuthProviderConfig>;
        [OAuthProviderName.OIDC]: ConfigItem<OAuthOIDCProviderConfig>;
      };
    };
  }
}

defineModuleConfig('oauth', {
  'providers.google': {
    desc: 'Google OAuth provider config',
    default: {
      clientId: '',
      clientSecret: '',
    },
  },
  'providers.github': {
    desc: 'GitHub OAuth provider config',
    default: {
      clientId: '',
      clientSecret: '',
    },
  },
  'providers.oidc': {
    desc: 'OIDC OAuth provider config',
    default: {
      clientId: '',
      clientSecret: '',
      issuer: '',
      args: {},
    },
  },
});
