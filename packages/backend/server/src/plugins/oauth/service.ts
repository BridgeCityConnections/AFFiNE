import { randomUUID } from 'node:crypto';

import { Injectable, OnModuleInit } from '@nestjs/common';

import { OnEvent, SessionCache } from '../../base';
import { ServerFeature, ServerService } from '../../core';
import { OAuthProviderName } from './config';
import { OAuthProviderFactory } from './factory';

const OAUTH_STATE_KEY = 'OAUTH_STATE';

interface OAuthState {
  redirectUri?: string;
  client?: string;
  clientNonce?: string;
  provider: OAuthProviderName;
}

@Injectable()
export class OAuthService implements OnModuleInit {
  constructor(
    private readonly providerFactory: OAuthProviderFactory,
    private readonly cache: SessionCache,
    private readonly server: ServerService
  ) {}

  isValidState(stateStr: string) {
    return stateStr.length === 36;
  }

  async saveOAuthState(state: OAuthState) {
    const token = randomUUID();
    await this.cache.set(`${OAUTH_STATE_KEY}:${token}`, state, {
      ttl: 3600 * 3 * 1000 /* 3 hours */,
    });

    return token;
  }

  async getOAuthState(token: string) {
    return this.cache.get<OAuthState>(`${OAUTH_STATE_KEY}:${token}`);
  }

  availableOAuthProviders() {
    return this.providerFactory.providers;
  }

  onModuleInit() {
    this.checkFeature();
  }

  @OnEvent('config.changed')
  onConfigUpdated(event: Events['config.changed']) {
    if ('oauth' in event.updates) {
      this.checkFeature();
    }
  }

  private checkFeature() {
    const enabled = this.availableOAuthProviders().length > 0;
    if (enabled) {
      this.server.enableFeature(ServerFeature.OAuth);
    } else {
      this.server.disableFeature(ServerFeature.OAuth);
    }
  }
}
