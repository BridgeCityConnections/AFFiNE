import { Logger } from '@nestjs/common';
import {
  Args,
  Field,
  GraphQLISODateTime,
  Mutation,
  ObjectType,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { RuntimeConfig, RuntimeConfigType } from '@prisma/client';
import { GraphQLJSON, GraphQLJSONObject } from 'graphql-scalars';

import { Config, URLHelper } from '../../base';
import { Namespace } from '../../env';
import { Feature } from '../../models';
import { Public } from '../auth';
import { Admin } from '../common';
import { AvailableUserFeatureConfig } from '../features';
import { ServerFlags } from './config';
import { ServerService } from './service';
import { ServerConfigType } from './types';

@ObjectType()
export class PasswordLimitsType {
  @Field()
  minLength!: number;
  @Field()
  maxLength!: number;
}

@ObjectType()
export class CredentialsRequirementType {
  @Field()
  password!: PasswordLimitsType;
}

registerEnumType(RuntimeConfigType, {
  name: 'RuntimeConfigType',
});

@ObjectType()
export class ReleaseVersionType {
  @Field()
  version!: string;

  @Field()
  url!: string;

  @Field(() => GraphQLISODateTime)
  publishedAt!: Date;

  @Field()
  changelog!: string;
}

const RELEASE_CHANNEL_MAP = new Map<Namespace, string>([
  [Namespace.Dev, 'canary'],
  [Namespace.Beta, 'beta'],
  [Namespace.Production, 'stable'],
]);
@ObjectType()
export class ServerRuntimeConfigType implements Partial<RuntimeConfig> {
  @Field()
  id!: string;

  @Field()
  module!: string;

  @Field()
  key!: string;

  @Field()
  description!: string;

  @Field(() => GraphQLJSON)
  value!: any;

  @Field(() => RuntimeConfigType)
  type!: RuntimeConfigType;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

@ObjectType()
export class ServerFlagsType implements ServerFlags {
  @Field()
  earlyAccessControl!: boolean;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    deprecationReason: 'not used anymore',
  })
  syncClientVersionCheck?: boolean;
}

@Resolver(() => ServerConfigType)
export class ServerConfigResolver {
  private readonly logger = new Logger(ServerConfigResolver.name);

  constructor(
    private readonly config: Config,
    private readonly url: URLHelper,
    private readonly server: ServerService
  ) {}

  @Public()
  @Query(() => ServerConfigType, {
    description: 'server config',
  })
  serverConfig(): ServerConfigType {
    return {
      name:
        this.config.server.name ??
        (env.selfhosted
          ? 'AFFiNE Selfhosted Cloud'
          : env.namespaces.canary
            ? 'AFFiNE Canary Cloud'
            : env.namespaces.beta
              ? 'AFFiNE Beta Cloud'
              : 'AFFiNE Cloud'),
      version: env.version,
      baseUrl: this.url.home,
      type: env.DEPLOYMENT_TYPE,
      // BACKWARD COMPATIBILITY
      // the old flavors contains `selfhosted` but it actually not flavor but deployment type
      // this field should be removed after frontend feature flags implemented
      flavor: env.DEPLOYMENT_TYPE,
      features: this.server.features,
      // not actually used
      enableTelemetry: false,
    };
  }

  @ResolveField(() => CredentialsRequirementType, {
    description: 'credentials requirement',
  })
  async credentialsRequirement() {
    return {
      password: {
        minLength: this.config.auth.passwordRequirements.min,
        maxLength: this.config.auth.passwordRequirements.max,
      },
    };
  }

  @ResolveField(() => ServerFlagsType, {
    description: 'server flags',
  })
  async flags(): Promise<ServerFlagsType> {
    return this.config.flags;
  }

  @ResolveField(() => Boolean, {
    description: 'whether server has been initialized',
  })
  async initialized() {
    return this.server.initialized();
  }

  @ResolveField(() => ReleaseVersionType, {
    description: 'fetch latest available upgradable release of server',
  })
  async availableUpgrade(): Promise<ReleaseVersionType | null> {
    const channel = RELEASE_CHANNEL_MAP.get(env.NAMESPACE) ?? 'stable';
    const url = `https://affine.pro/api/worker/releases?channel=${channel}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        this.logger.error(
          'failed to fetch affine releases',
          await response.text()
        );
        return null;
      }
      const releases = (await response.json()) as Array<{
        name: string;
        url: string;
        body: string;
        published_at: string;
      }>;

      const latest = releases.at(0);
      if (!latest || latest.name === env.version) {
        return null;
      }

      return {
        version: latest.name,
        url: latest.url,
        changelog: latest.body,
        publishedAt: new Date(latest.published_at),
      };
    } catch (e) {
      this.logger.error('failed to fetch affine releases', e);
      return null;
    }
  }
}

@Resolver(() => ServerConfigType)
export class ServerFeatureConfigResolver extends AvailableUserFeatureConfig {
  @ResolveField(() => [Feature], {
    description: 'Features for user that can be configured',
  })
  override availableUserFeatures() {
    return super.availableUserFeatures();
  }
}

@ObjectType()
class ServerServiceConfig {
  @Field()
  name!: string;

  @Field(() => GraphQLJSONObject)
  config!: any;
}

interface ServerServeConfig {
  https: boolean;
  host: string;
  port: number;
  externalUrl: string;
}

interface ServerMailerConfig {
  host?: string | null;
  port?: number | null;
  secure?: boolean | null;
  service?: string | null;
  sender?: string | null;
}

interface ServerDatabaseConfig {
  host: string;
  port: number;
  user?: string | null;
  database: string;
}

@Admin()
@Resolver(() => ServerRuntimeConfigType)
export class ServerRuntimeConfigResolver {
  @Query(() => [ServerRuntimeConfigType], {
    description: 'get all server runtime configurable settings',
  })
  async serverRuntimeConfig(): Promise<ServerRuntimeConfigType[]> {
    return [];
  }

  @Mutation(() => ServerRuntimeConfigType, {
    description: 'update server runtime configurable setting',
  })
  async updateRuntimeConfig(
    @Args('id') id: string,
    @Args({ type: () => GraphQLJSON, name: 'value' }) value: any
  ): Promise<ServerRuntimeConfigType> {
    throw new Error('Not implemented');
  }

  @Mutation(() => [ServerRuntimeConfigType], {
    description: 'update multiple server runtime configurable settings',
  })
  async updateRuntimeConfigs(
    @Args({ type: () => GraphQLJSONObject, name: 'updates' }) updates: any
  ): Promise<ServerRuntimeConfigType[]> {
    return [];
  }
}

@Admin()
@Resolver(() => ServerServiceConfig)
export class ServerServiceConfigResolver {
  constructor(private readonly config: Config) {}

  @Query(() => [ServerServiceConfig])
  serverServiceConfigs() {
    return [
      {
        name: 'server',
        config: this.serve(),
      },
      {
        name: 'mailer',
        config: this.mail(),
      },
      {
        name: 'database',
        config: this.database(),
      },
    ];
  }

  serve(): ServerServeConfig {
    return this.config.server;
  }

  mail(): ServerMailerConfig {
    const { enabled, SMTP } = this.config.mailer;

    if (!enabled) {
      return {
        host: null,
        port: null,
        secure: null,
        service: null,
        sender: null,
      };
    }

    const sender =
      typeof SMTP.from === 'string' ? SMTP.from : SMTP.from?.address;

    return {
      host: SMTP.host,
      port: SMTP.port,
      secure: SMTP.secure,
      service: SMTP.service,
      sender,
    };
  }

  database(): ServerDatabaseConfig {
    const url = new URL(this.config.db.datasourceUrl);

    return {
      host: url.hostname,
      port: Number(url.port),
      user: url.username,
      database: url.pathname.slice(1) ?? url.username,
    };
  }
}
