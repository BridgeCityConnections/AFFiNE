import { ApolloDriverConfig } from '@nestjs/apollo';

import { defineModuleConfig } from '../config';

declare global {
  interface AppConfig {
    graphql: {
      apolloDriverConfig: ConfigItem<ApolloDriverConfig>;
    };
  }
}

defineModuleConfig('graphql', {
  apolloDriverConfig: {
    desc: 'The config for underlying nestjs GraphQL and apollo driver engine.',
    default: {
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      useGlobalPrefix: true,
      playground: true,
      introspection: true,
      sortSchema: true,
    },
  },
});
