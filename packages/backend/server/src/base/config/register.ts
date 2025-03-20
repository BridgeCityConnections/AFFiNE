import { set } from 'lodash-es';
import { ZodType } from 'zod';

import { ModularizedAppConfig } from './types';

export type EnvConfigType = 'string' | 'int' | 'float' | 'boolean';

export type ConfigDescription<T> = {
  desc: string;
  default?: T;
  validate?: (value: T) => boolean;
  shape?: ZodType<T>;
  env?: string | [string, EnvConfigType?];
  link?: string;
};

type AppConfigDescriptors<T> = {
  [K in keyof T]: T[K] extends ConfigItem<infer V>
    ? ConfigDescription<V>
    : ConfigDescription<T[K]>;
};

export function defaultValidator(
  defaultValue: any,
  shape?: ZodType<any>
): ((val: any) => boolean) | undefined {
  if (shape) {
    return val => shape.safeParse(val).success;
  }

  switch (typeof defaultValue) {
    case 'string':
      return val => typeof val === 'string';
    case 'number':
      return val => typeof val === 'number';
    case 'boolean':
      return val => typeof val === 'boolean';
    default:
      return undefined;
  }
}
/**
 * parse number value from environment variables
 */
function int(value: string) {
  const n = parseInt(value);
  return Number.isNaN(n) ? undefined : n;
}

function float(value: string) {
  const n = parseFloat(value);
  return Number.isNaN(n) ? undefined : n;
}

function boolean(value: string) {
  return value === '1' || value.toLowerCase() === 'true';
}

const envParsers: Record<EnvConfigType, (value: string) => unknown> = {
  int,
  float,
  boolean,
  string: value => value,
};

export function parseEnvValue(value: string | undefined, type: EnvConfigType) {
  if (value === undefined) {
    return;
  }

  return envParsers[type](value);
}

export const APP_CONFIG_DESCRIPTORS: Record<
  string,
  Record<string, ConfigDescription<any>>
> = {};

export function defineModuleConfig<T extends keyof ModularizedAppConfig>(
  module: T,
  defs: AppConfigDescriptors<ModularizedAppConfig[T]>
) {
  // set default validators from `shape` or `primitive type`
  (Object.values(defs) as ConfigDescription<any>[]).forEach(value => {
    if (!value.validate) {
      value.validate = defaultValidator(value.default, value.shape);
    }
  });

  APP_CONFIG_DESCRIPTORS[module] = {
    ...APP_CONFIG_DESCRIPTORS[module],
    ...defs,
  };
}

export function getDefaultConfig(): AppConfig {
  const config: Record<string, any> = {};
  const envs = process.env;

  for (const [module, defs] of Object.entries(APP_CONFIG_DESCRIPTORS)) {
    const modulizedConfig = {};

    for (const [key, desc] of Object.entries(defs)) {
      let defaultValue = desc.default;

      if (desc.env) {
        const [env, parser = 'string'] = Array.isArray(desc.env)
          ? desc.env
          : [desc.env];

        const envValue = envs[env];
        if (envValue) {
          defaultValue = parseEnvValue(envValue, parser);
        }
      }

      if (desc.validate && !desc.validate(defaultValue)) {
        throw new Error(
          `Invalid config value for ${module}.${key}, got ${defaultValue}`
        );
      }

      set(modulizedConfig, key, defaultValue);
    }

    config[module] = modulizedConfig;
  }

  return config as AppConfig;
}
