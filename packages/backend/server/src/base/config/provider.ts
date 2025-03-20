import { FactoryProvider } from '@nestjs/common';

import { Config } from './config';
import { ConfigLoader } from './loader';

export const ConfigProvider: FactoryProvider<Config> = {
  provide: Config,
  // @ts-expect-error allow
  useFactory: (loader: ConfigLoader) => {
    return loader.config;
  },
  inject: [ConfigLoader],
};
