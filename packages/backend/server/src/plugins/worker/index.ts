import './config';

import { Module } from '@nestjs/common';

import { WorkerController } from './controller';

@Module({
  controllers: [WorkerController],
})
export class WorkerModule {}
