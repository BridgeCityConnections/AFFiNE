import { Join } from '../utils';

declare global {
  type ConfigItem<T> = T & { __type: never };
  interface AppConfig {}
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : any;

type FlattenObjectPaths<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends ConfigItem<infer V>
    ? { [P in Join<Prefix, K & string>]: V }
    : T[K] extends PrimitiveType
      ? { [P in Join<Prefix, K & string>]: T[K] }
      : T[K] extends object
        ? FlattenObjectPaths<T[K], Join<Prefix, K & string>>
        : never;
}[keyof T];

export type ModularizedAppConfig = {
  [Module in keyof AppConfig]: UnionToIntersection<
    FlattenObjectPaths<AppConfig[Module]>
  >;
};
