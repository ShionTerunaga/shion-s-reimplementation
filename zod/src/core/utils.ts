export type AnyFunc = (...args: any[]) => any;
export type Identity<T> = T;
export type Flatten<T> = Identity<{ [k in keyof T]: T[k] }>;
export type MakePartial<T, K extends keyof T> = Omit<T, K> &
  InexactPartial<Pick<T, K>>;
export type MaybeAsync<T> = T | Promise<T>;

export type InexactPartial<T> = {
  [P in keyof T]?: T[P] | undefined;
};
export type Primitive =
  | string
  | number
  | symbol
  | bigint
  | boolean
  | null
  | undefined;
export type PrimitiveSet = Set<Primitive>;
export type PropValues = Record<string, Set<Primitive>>;

export type LoosePartial<T extends object> = InexactPartial<T> & {
  [k: string]: unknown;
};
