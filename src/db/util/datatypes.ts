/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use of `any` in this module is generally deliberate to help with generics
 */
import * as t from 'io-ts';

// Field Types

export const DATE = new t.Type<Date, Date>(
  'Date',
  (u): u is Date => u instanceof Date,
  (u, c) => (u instanceof Date ? t.success(u) : t.failure(u, c)),
  (a) => a
);

/**
 * Like `Partial`, but for `null` instead of `undefined`
 */
export type Nullable<O> = {
  [K in keyof O]: O[K] | null;
};

export type NullableProps<P extends t.Props> = {
  [K in keyof P]: t.UnionC<[t.NullC, P[K]]>;
};

/**
 * Take a property definition, and allow them all to be null
 */
export const nullable = <P extends t.Props>(
  props: P
): t.TypeC<NullableProps<P>> => {
  return t.type(
    Object.fromEntries(
      Object.entries(props).map(([key, typeDef]) => [
        key,
        t.union([t.null, typeDef]),
      ])
    )
  ) as unknown as t.TypeC<NullableProps<P>>;
};

export const FILE_REFERENCE = t.type({
  /**
   * The content hash of a particular file with-respect-to a particular
   * namespace (see app/lib/files.ts)
   */
  fileHash: t.string,
});

export type FileReference = t.TypeOf<typeof FILE_REFERENCE>;
