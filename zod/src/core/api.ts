import * as schema from "./schemas";
import * as checks from "./checks";
import * as errors from "./errors";
import * as utils from "./utils";

export type Params<
  T extends schema.$ZodType | checks.$ZodCheck,
  IssueTypes extends errors.$ZodIssueBase,
  OmitKeys extends keyof T["_zod"]["def"] = never
> = utils.Flatten<
  Partial<
    utils.EmptyToNever<
      Omit<T["_zod"]["def"], OmitKeys> &
        ([IssueTypes] extends [never]
          ? {}
          : {
              error?: string | errors.$ZodErrorMap<IssueTypes> | undefined;
              message?: string | undefined;
            })
    >
  >
>;

export type TypeParams<
  T extends schema.$ZodType = schema.$ZodType & { _isst: never },
  AlsoOmit extends Exclude<
    keyof T["_zod"]["def"],
    "type" | "checks" | "error"
  > = never
> = Params<
  T,
  NonNullable<T["_zod"]["isst"]>,
  "type" | "checks" | "error" | AlsoOmit
>;

export type $ZodStringParams = TypeParams<schema.$ZodString<string>, "coerce">;
export type StringFormatParams<
  T extends schema.$ZodStringFormat = schema.$ZodStringFormat,
  AlsoOmit extends Exclude<
    keyof T["_zod"]["def"],
    "type" | "coerce" | "checks" | "error" | "check" | "format"
  > = never
> = Params<
  T,
  NonNullable<T["_zod"]["isst"] | T["_zod"]["issc"]>,
  "type" | "coerce" | "checks" | "error" | "check" | "format" | AlsoOmit
>;

//Email
export type $ZodEmailParams = StringFormatParams<schema.$ZodEmail>;
