import { Injectable } from '@nestjs/common';

import { Models } from '../../models';
import { ServerFeature } from './types';

@Injectable()
export class ServerService {
  private _initialized: boolean | null = null;
  readonly #features = new Set<ServerFeature>();
  constructor(private readonly models: Models) {}

  get features() {
    return Array.from(this.#features);
  }

  async initialized() {
    if (!this._initialized) {
      const userCount = await this.models.user.count();
      this._initialized = userCount > 0;
    }

    return this._initialized;
  }

  enableFeature(feature: ServerFeature) {
    this.#features.add(feature);
  }

  disableFeature(feature: ServerFeature) {
    this.#features.delete(feature);
  }
}
