import * as scheme from "./schemas";
import type { Class } from "./utils";

type ZodTrait = { _zod: { def: any; [k: string]: any } };

export function $constructor<T extends ZodTrait, D = T["_zod"]["def"]>(
  name: string,
  initializer: (inst: T, def: D) => void,
  params?: { Parent?: typeof Class }
) {
  function init(inst: T, def: D) {
    //properties initialization
    Object.defineProperty(inst, "_zod", {
      value: inst._zod ?? {},
      enumerable: false,
    });

    inst._zod.traits ??= new Set();

    inst._zod.traits.add(name);
    initializer(inst, def);

    for (const k in _.prototype) {
      // function _ のproperty
      if (!(k in inst))
        Object.defineProperty(inst, k, { value: _.prototype[k].bind(inst) });
    }
    inst._zod.constr = _;
    inst._zod.def = def;
  }

  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {}
  Object.defineProperty(Definition, "name", { value: name });

  function _(this: any, def: D) {
    const inst = params?.Parent ? new Definition() : this;

    init(inst, def);
    inst._zod.deferred ??= [];
    for (const fn of inst._zod.deferred) {
      fn();
    }

    return inst;
  }

  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst: any) => {
      if (params?.Parent && inst instanceof params.Parent) return true;
      return inst?._zod?.traits?.has(name);
    },
  });
  Object.defineProperty(_, "name", { value: name });

  return _ as any;
}

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
