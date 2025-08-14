import * as error from "./errors";
import * as schemes from "./schemas";
import * as util from "./utils";

export interface $ZodCheckDef {
  check: string;
  error?: error.$ZodErrorMap<never> | undefined;
  abort?: boolean | undefined;
  when?: ((payload: schemes.ParsePayload) => boolean) | undefined;
}

export interface $ZodCheckInternals<T> {
  def: $ZodCheckDef;
  issc?: error.$ZodIssueBase;
  check(payloads: schemes.ParsePayload<T>): util.MaybeAsync<void>;
}

export interface $ZodCheck<in T = never> {
  _zod: $ZodCheckInternals<T>;
}

export type $ZodStringFormats =
  | "email"
  | "url"
  | "emoji"
  | "uuid"
  | "guid"
  | "nanoid"
  | "cuid"
  | "cuid2"
  | "ulid"
  | "xid"
  | "ksuid"
  | "datetime"
  | "date"
  | "time"
  | "duration"
  | "ipv4"
  | "ipv6"
  | "cidrv4"
  | "cidrv6"
  | "base64"
  | "base64url"
  | "json_string"
  | "e164"
  | "lowercase"
  | "uppercase"
  | "regex"
  | "jwt"
  | "starts_with"
  | "ends_with"
  | "includes";

export interface $ZodCheckStringFormatDef<Format extends string = string>
  extends $ZodCheckDef {
  check: "string_format";
  format: Format;
  pattern?: RegExp | undefined;
}

export interface $ZodCheckStringFormatInternals
  extends $ZodCheckInternals<string> {
  def: $ZodCheckStringFormatDef;
  issc: error.$ZodIssueInvalidStringFormat;
}
