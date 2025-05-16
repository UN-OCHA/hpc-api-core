import { isRight } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import type { FieldDefinition } from '../db/util/model-definition';

/**
 * This type allows us to restrict assignments of other types.
 *
 * For example,
 * to prevent us using IDs for one table field as an ID for another,
 * we can define branded types for the ID fields of two different tables,
 * which will prevent us using the ID of one table as the ID of another:
 *
 * ```
 * type IDA = Brand<number, { readonly s: unique symbol }, 'ID for table a'>;
 * type IDB = Brand<number, { readonly s: unique symbol }, 'ID for table b'>;
 *
 * const a: IDA = createBrandedValue(3);
 * const b: IDB = a; // <-- this will cause a type error
 * ```
 */
export type Brand<T, S extends { s: symbol }, Label extends string = ''> = T & {
  readonly __brand__: S;
  readonly __label__: Label;
};

export const createBrandedValue = <T, B extends Brand<T, any, any>>(v: T): B =>
  v as unknown as B;

export type NonNegativeInteger<T extends number> = `${T}` extends
  | `-${string}`
  | `${string}.${string}`
  ? never
  : T;

export const getTableColumns = <
  T extends { _internals: { fields: FieldDefinition } },
>(
  table: T
): string[] => {
  const {
    generated,
    generatedCompositeKey,
    nonNullWithDefault,
    required,
    optional,
    accidentallyOptional,
  } = table._internals.fields;

  // Collect columns from all subsets
  const columns = [
    ...Object.keys(generated ?? {}),
    ...Object.keys(generatedCompositeKey ?? {}),
    ...Object.keys(nonNullWithDefault ?? {}),
    ...Object.keys(required ?? {}),
    ...Object.keys(optional ?? {}),
    ...Object.keys(accidentallyOptional ?? {}),
  ];

  return columns;
};

/**
 * Codec to represent built-in `Map` type.
 *
 * Be warned that `JSON.stringify()` and `JSON.parse()` don't support `Map` and this can
 * lead to unexpected behavior if you use this codec in serialization/deserialization.
 *
 * ```ts
 * // Will give you an empty object in string instead of serialized `Map`
 * JSON.stringify(new Map([[1, 'value']])); // Produces '{}'
 * ```
 */
export const map = <K, V>(
  domain: t.Type<K>,
  codomain: t.Type<V>,
  name = `Map<${domain.name}, ${codomain.name}>`
): t.Type<Map<K, V>> => {
  return new t.Type(
    name,
    (u): u is Map<K, V> =>
      u instanceof Map &&
      [...u].every(([key, value]) => domain.is(key) && codomain.is(value)),
    (u, c) => {
      if (!(u instanceof Map)) {
        return t.failure(u, c, 'Input is not a Map');
      }

      let validationResult;
      let validationError: string | null = null;
      for (const [key, value] of u) {
        // Validate key
        if (!isRight((validationResult = domain.validate(key, c)))) {
          validationError = `Invalid type for key: '${key}'. Error: ${PathReporter.report(validationResult)}`;
          break;
        }
        // Validate value
        if (!isRight((validationResult = codomain.validate(value, c)))) {
          validationError = `Invalid type for value at key: '${key}'. Error: ${PathReporter.report(validationResult)}`;
          break;
        }
      }

      return validationError !== null
        ? t.failure(u, c, validationError)
        : t.success(u as Map<K, V>);
    },
    t.identity
  );
};
