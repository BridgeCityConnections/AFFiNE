import { Injectable, Logger } from '@nestjs/common';

import { OAuthProviderName } from './config';
import type { OAuthProvider } from './providers/def';

@Injectable()
export class OAuthProviderFactory {
  private readonly logger = new Logger(OAuthProviderFactory.name);
  readonly #providers = new Map<OAuthProviderName, OAuthProvider>();

  get providers() {
    return Array.from(this.#providers.keys());
  }

  get(name: OAuthProviderName): OAuthProvider | undefined {
    return this.#providers.get(name);
  }

  register(provider: OAuthProvider) {
    this.#providers.set(provider.provider, provider);
    this.logger.log(`OAuth provider [${provider.provider}] registered.`);
  }

  unregister(provider: OAuthProvider) {
    this.#providers.delete(provider.provider);
    this.logger.log(`OAuth provider [${provider.provider}] unregistered.`);
  }
}
