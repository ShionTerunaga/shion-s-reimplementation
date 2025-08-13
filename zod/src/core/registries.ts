import type { $ZodType } from "./schemas";
import * as core from "./core";

export const $output: unique symbol = Symbol("ZodOutput");
export type $output = typeof $output;
export const $input: unique symbol = Symbol("ZodInput");
export type $input = typeof $input;

export type $replace<Meta, S extends $ZodType> = Meta extends $output
  ? core.output<S>
  : Meta extends $input
  ? core.input<S>
  : Meta extends Array<infer M>
  ? Array<$replace<M, S>>
  : Meta extends (...args: infer P) => infer R
  ? (
      ...args: {
        [K in keyof P]: $replace<P[K], S>;
      }
    ) => $replace<R, S>
  : Meta extends object
  ? { [K in keyof Meta]: $replace<Meta[K], S> }
  : Meta;

type MetadataType = ({ id?: string } & object) | undefined;

export class $ZodRegistry<
  Meta extends MetadataType = MetadataType,
  Schema extends $ZodType = $ZodType
> {
  _meta!: Meta;
  _schema!: Schema;
  _map: Map<Schema, $replace<Meta, Schema>> = new Map();
  _idmap: Map<string, Schema> = new Map();

  add<S extends Schema>(
    schema: S,
    ..._meta: undefined extends Meta
      ? [$replace<Meta, S>?]
      : [$replace<Meta, S>]
  ): this {
    const meta = _meta[0];

    this._map.set(schema, meta!);

    if (meta && typeof meta === "object" && "id" in meta) {
      if (meta && typeof meta.id === "string" && this._idmap.has(meta.id)) {
        throw new Error(`ID ${meta.id} はすでに登録されています。`);
      }

      this._idmap.set(meta.id!, schema);
    }

    return this;
  }

  clear(): this {
    this._map = new Map();
    this._idmap = new Map();
    return this;
  }

  remove(schema: Schema): this {
    const meta = this._map.get(schema);

    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.delete(meta.id!);
    }

    this._map.delete(schema);

    return this;
  }

  get<S extends Schema>(schema: S): $replace<Meta, S> | undefined {
    const p = schema._zod.parent as Schema; //ここは以後の課題

    if (p) {
      const pm = { ...this.get(p) };
      if (!("id" in pm)) return;

      delete pm.id;

      const f = { ...pm, ...this._map.get(schema) };

      return Object.keys(f).length ? (f as $replace<Meta, S>) : undefined; //ここも以後検討
    }
  }

  has(schema: Schema): boolean {
    return this._map.has(schema);
  }
}
