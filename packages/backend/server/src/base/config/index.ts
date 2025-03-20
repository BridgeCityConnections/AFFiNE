import { DynamicModule } from '@nestjs/common';

import { Config } from './config';
import { ConfigLoader } from './loader';
import { ConfigProvider } from './provider';

export class ConfigModule {
  static forRoot(overrides: DeepPartial<AppConfig> = {}): DynamicModule {
    return {
      global: true,
      module: ConfigModule,
      providers: [ConfigProvider, ConfigLoader.withOverrides(overrides)],
      exports: [ConfigProvider, ConfigLoader],
    };
  }
}

export { Config, ConfigLoader };
export { defineModuleConfig } from './register';
