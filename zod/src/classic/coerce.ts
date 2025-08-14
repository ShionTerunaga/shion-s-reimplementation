import * as core from "../core";
import * as schema from "./schemas";

export interface ZodCoercedString<T = unknown>
  extends schema._ZodString<core.$ZodStringInternals<T>> {}
export function string<T = unknown>(params?: string | core.$ZodStringParams) {}
