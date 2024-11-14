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
