import * as cores from "../core";

export interface ZodType<
  out Output = unknown,
  out Input = unknown,
  out Internals extends cores.$ZodTypeInternals<
    Output,
    Input
  > = cores.$ZodTypeInternals<Output, Input>
> extends cores.$ZodType<Output, Input, Internals> {
  def: Internals["def"];
  type: Internals["def"]["type"];
  _def: Internals["def"];
  _output: Internals["output"];
  _input: Internals["input"];

  check(
    ...checks: Array<cores.CheckFn<cores.output<this>> | cores.$ZodCheck>
  ): this;
  clone(def?: Internals["def"], params?: { parent: boolean }): this;
  register<R extends cores.$ZodRegistry>(
    register: R,
    ...meta: this extends R["_schema"]
      ? undefined extends R["_meta"]
        ? [cores.$replace<R["_meta"], this>?]
        : [cores.$replace<R["_meta"], this>]
      : ["Incompatible schema"]
  ): this;

  brand<T extends PropertyKey = PropertyKey>(
    value?: T
  ): PropertyKey extends T ? this : cores.$ZodBranded<this, T>;

  parse(
    data: unknown,
    params?: cores.ParseContext<cores.$ZodIssue>
  ): cores.output<this>;
}

export interface _ZodType<
  out Internals extends cores.$ZodTypeInternals = cores.$ZodTypeInternals
> extends ZodType {}

export interface _ZodString<
  T extends cores.$ZodStringInternals<unknown> = cores.$ZodStringInternals<unknown>
> extends _ZodType<T> {}

export interface ZodString {}
