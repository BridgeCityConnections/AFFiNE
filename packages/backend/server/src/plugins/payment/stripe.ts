import { FactoryProvider, Injectable } from '@nestjs/common';
import { omit } from 'lodash-es';
import Stripe from 'stripe';

import { Config, OnEvent } from '../../base';

@Injectable()
export class StripeInstanceWrapper {
  #stripe!: Stripe;

  constructor(private readonly config: Config) {
    this.setup();
  }

  get stripe() {
    return this.#stripe;
  }

  setup() {
    this.#stripe = new Stripe(this.config.payment.apiKey, {
      ...omit(this.config.payment.stripe, 'keys'),
    });
  }

  onModuleInit() {
    this.setup();
  }

  @OnEvent('config.changed')
  async onConfigChanged(event: Events['config.changed']) {
    if ('payment' in event.updates) {
      this.setup();
    }
  }
}

export const StripeProvider: FactoryProvider = {
  provide: Stripe,
  useFactory: (provider: StripeInstanceWrapper) => {
    return provider.stripe;
  },
  inject: [StripeInstanceWrapper],
};
