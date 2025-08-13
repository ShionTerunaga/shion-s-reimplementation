import type { version } from "./versions";
import type * as errors from "./errors.js";
import * as util from "./utils.js";
import type * as core from "./core.js";
import type * as checks from "./checker.js";
import type { StandardSchemaV1 } from "./standard-schema.js";

export interface $ZodTypeInternals<out O = unknown, out I = unknown>
  extends _$ZodTypeInternals {
  output: O;
  input: I;
}

export interface _$ZodTypeInternals {
  version: typeof version;
  def: $ZodTypeDef;
  deferred: Array<util.AnyFunc> | undefined;
  run(
    payload: ParsePayload<any>,
    ctx: ParseContextInternal
  ): util.MaybeAsync<ParsePayload>;
  parse(
    payload: ParsePayload<any>,
    ctx: ParseContextInternal
  ): util.MaybeAsync<ParsePayload>;

  traits: Set<string>;

  optin?: "optional" | undefined;
  optout?: "optional" | undefined;

  values?: util.PrimitiveSet | undefined;

  propValues?: util.PropValues | undefined;

  pattern: RegExp | undefined;

  constr: new (def: any) => $ZodType;

  bag: Record<string, unknown>;

  isst: errors.$ZodIssueBase;

  toJSONSchema?: () => unknown;

  parent?: $ZodType | undefined;
}

export type $ZodStandardSchema<T> = StandardSchemaV1.Props<
  core.input<T>,
  core.output<T>
>;

export interface $ZodType<
  O = unknown,
  I = unknown,
  Internals extends $ZodTypeInternals<O, I> = $ZodTypeInternals<O, I>
> {
  _zod: Internals;
  "~standard": $ZodStandardSchema<this>;
}

export interface $ZodTypeDef {
  type:
    | "string"
    | "number"
    | "int"
    | "bigint"
    | "boolean"
    | "symbol"
    | "null"
    | "undefined"
    | "void"
    | "never"
    | "any"
    | "unknown"
    | "date"
    | "object"
    | "record"
    | "file"
    | "array"
    | "tuple"
    | "union"
    | "intersection"
    | "map"
    | "set"
    | "enum"
    | "literal"
    | "nullable"
    | "optional"
    | "nonoptional"
    | "success"
    | "transform"
    | "default"
    | "prefault"
    | "catch"
    | "nan"
    | "pipe"
    | "readonly"
    | "template_literal"
    | "promise"
    | "lazy"
    | "custom";
  error?: errors.$ZodErrorMap<never> | undefined;
  checks?: Array<checks.$ZodCheck<never>>;
}

export interface ParseContext<T extends errors.$ZodIssueBase = never> {
  readonly error?: errors.$ZodErrorMap<T>;
  readonly reportInput?: boolean;
  readonly jitless?: boolean;
}

export interface ParseContextInternal<T extends errors.$ZodIssueBase = never>
  extends ParseContext<T> {
  readonly async?: boolean | undefined;
}

export interface ParsePayload<T = unknown> {
  value: T;
  issue: Array<errors.$ZodRawIssue>;
}

export type CheckFn<T> = (intput: ParsePayload<T>) => util.MaybeAsync<void>;

export interface SomeType {
  _zod: _$ZodTypeInternals;
}
