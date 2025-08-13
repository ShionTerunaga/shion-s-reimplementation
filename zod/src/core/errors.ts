import type { $ } from "bun";
import type { $ZodCheck, $ZodStringFormats } from "./checker.js";
import type { $ZodType } from "./schemas";
import * as utils from "./utils.js";

export interface $ZodIssueBase {
  readonly code?: string;
  readonly input?: unknown;
  readonly path: PropertyKey[];
  readonly message: string;
}

export interface $ZodIssueInvalidType<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_type";
  readonly expected: $ZodType["_zod"];
}
interface ZodIssueTooBase<T extends "too_big" | "too_small", Input = unknown>
  extends $ZodIssueBase {
  readonly code: T;
  readonly origin:
    | "number"
    | "int"
    | "bigint"
    | "data"
    | "string"
    | "array"
    | "set"
    | "file"
    | (string & {});
  readonly maximum: number | bigint;
  readonly inclusive?: boolean;
  readonly exact?: boolean;
  readonly input?: Input;
}

export type $ZodIssueTooBig<Input = unknown> = ZodIssueTooBase<
  "too_big",
  Input
>;
export type $ZodIssueTooSmall<Input = unknown> = ZodIssueTooBase<
  "too_small",
  Input
>;

export interface $ZodIssueInvalidStringFormat extends $ZodIssueBase {
  readonly code: "invalid_format";
  readonly expected: $ZodStringFormats | (string & {});
  readonly pattern?: string;
  readonly input: string;
}

export interface $ZodIssueNotMultipleOf<
  Input extends number | bigint = number | bigint
> extends $ZodIssueBase {
  readonly code: "not_multiple_of";
  readonly divisor: number;
  readonly input: Input;
}

export interface $ZodIssueUnrecognizedKey extends $ZodIssueBase {
  readonly code: "unrecognized_keys";
  readonly keys: string[];
  readonly input: Record<string, unknown>;
}

export interface $ZodIssueInvalidKey<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_key";
  readonly origin: "map" | "record";
  readonly issue: Array<$ZodIssue>;
  readonly input?: Input;
}

export interface $ZodIssueInvalidElement<Input = unknown>
  extends $ZodIssueBase {
  readonly code: "invalid_element";
  readonly origin: "map" | "set";
  readonly key: unknown;
  readonly issues: Array<$ZodIssue>;
  readonly input?: Input;
}

export interface $ZodIssueInvalidValue<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_value";
  readonly value: Array<utils.Primitive>;
  readonly input?: Input;
}

export interface $ZodIssueCustom extends $ZodIssueBase {
  readonly code: "custom";
  readonly params: Record<string, any> | undefined;
  readonly input?: unknown;
}

export interface $ZodErrorMap<T extends $ZodIssueBase = $ZodIssue> {
  (issue: $ZodRawIssue<T>): { message: string } | string | undefined | null;
}

export type $ZodRawIssue<T extends $ZodIssueBase = $ZodIssue> =
  $ZodInternalIssue;

export type $ZodIssue =
  | $ZodIssueInvalidType
  | $ZodIssueTooBig
  | $ZodIssueTooSmall
  | $ZodIssueInvalidStringFormat
  | $ZodIssueNotMultipleOf
  | $ZodIssueUnrecognizedKey
  | $ZodIssueInvalidKey
  | $ZodIssueInvalidElement
  | $ZodIssueInvalidValue
  | $ZodIssueCustom;

export type $ZodInternalIssue<T extends $ZodIssueBase = $ZodIssue> =
  T extends any ? RawIssue<T> : never;
type RawIssue<T extends $ZodIssueBase> = T extends any
  ? utils.Flatten<
      utils.MakePartial<T, "message" | "path"> & {
        readonly input: unknown;
        readonly inst?: $ZodType | $ZodCheck;
        readonly continue?: boolean | undefined;
      } & Record<string, unknown>
    >
  : never;
