import { Type } from '@nestjs/common';

import { FsStorageConfig, FsStorageProvider } from './fs';
import { StorageProvider } from './provider';
import { R2StorageConfig, R2StorageProvider } from './r2';
import { S3StorageConfig, S3StorageProvider } from './s3';

export type StorageProviderName = 'fs' | 'aws-s3' | 'cloudflare-r2';
export const StorageProviders: Record<
  StorageProviderName,
  Type<StorageProvider>
> = {
  fs: FsStorageProvider,
  'aws-s3': S3StorageProvider,
  'cloudflare-r2': R2StorageProvider,
};

export type StorageProviderConfig = { bucket: string } & (
  | {
      provider: 'fs';
      config: FsStorageConfig;
    }
  | {
      provider: 'aws-s3';
      config: S3StorageConfig;
    }
  | {
      provider: 'cloudflare-r2';
      config: R2StorageConfig;
    }
);

export type * from './provider';
export { autoMetadata, toBuffer } from './utils';
