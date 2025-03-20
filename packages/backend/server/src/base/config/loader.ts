import { Injectable, OnApplicationBootstrap, Provider } from '@nestjs/common';
import { merge } from 'lodash-es';

import { EventBus } from '../event/eventbus';
import { getDefaultConfig } from './register';

declare global {
  interface Events {
    'config.init': {
      config: DeepReadonly<AppConfig>;
    };
    'config.changed': {
      updates: DeepPartial<AppConfig>;
    };
  }
}

/**
 * Configuration loader seq:
 *   1/ load all defaults introduced by `defineModuleConfig` in constructor
 *      (the DB config is not reloadable, so it's ok to inject `Config` in constructor)
 *   2/ load overrides from environment variables, depends on env map in `defineModuleConfig`
 *   3/ load database persisted overrides
 *   4/ emit `config.init` event, all config is up-to-date and ready to be used
 *   5/ emit `config.changed` event when config is changed runtimely
 */
@Injectable()
export class ConfigLoader implements OnApplicationBootstrap {
  static withOverrides(overrides: DeepPartial<AppConfig>): Provider {
    return {
      provide: ConfigLoader,
      useFactory: (event: EventBus) => new ConfigLoader(overrides, event),
      inject: [EventBus],
    };
  }

  #config: DeepReadonly<AppConfig> = this.loadDefault();

  constructor(
    private readonly overrides: DeepPartial<AppConfig>,
    private readonly event: EventBus
  ) {}

  get config() {
    return this.#config;
  }

  override(updates: DeepPartial<AppConfig>) {
    this.#config = Object.freeze(merge({}, this.#config, updates));
  }

  async onApplicationBootstrap() {
    const dbOverrides = await this.loadDB();
    this.override(dbOverrides);
    this.event.emit('config.init', {
      config: this.config,
    });
  }

  private loadDefault(): DeepReadonly<AppConfig> {
    const config = getDefaultConfig();
    return merge({}, config, this.overrides);
  }

  private async loadDB(): Promise<DeepPartial<AppConfig>> {
    return {};
  }
}
