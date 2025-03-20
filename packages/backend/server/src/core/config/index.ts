import './config';

import { Module } from '@nestjs/common';

import {
  ServerConfigResolver,
  ServerFeatureConfigResolver,
  ServerRuntimeConfigResolver,
  ServerServiceConfigResolver,
} from './resolver';
import { ServerService } from './service';

@Module({
  providers: [
    ServerService,
    ServerConfigResolver,
    ServerFeatureConfigResolver,
    ServerRuntimeConfigResolver,
    ServerServiceConfigResolver,
  ],
  exports: [ServerService],
})
export class ServerConfigModule {}
export { ServerService };
export { ServerFeature } from './types';
