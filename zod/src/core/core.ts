import * as scheme from "./schemas";

export type input<T> = T extends { _zod: { input: any } }
  ? T["_zod"]["input"]
  : unknown;
export type output<T> = T extends { _zod: { output: any } }
  ? T["_zod"]["output"]
  : unknown;

export const $brand: unique symbol = Symbol("zod_brand");
export type $brand<
  T extends string | number | symbol = string | number | symbol
> = {
  [$brand]: { [k in T]: true };
};

export type $ZodBranded<
  T extends scheme.SomeType,
  Brand extends string | number | symbol
> = T & Record<"_zod", Record<"output", output<T> & $brand>>;
