import * as t from 'io-ts';
import { Left } from 'fp-ts/lib/Either';

import { Brand } from './types';

/**
 * Create an `io-ts` type from a branded type definition and base `io-ts` type.
 *
 * The only runtime validation is what is provided by the base type definition,
 * whether something adheres to a brand cannot be computed at runtime, and only
 * provides static-time protection.
 */
export const brandedType = <Base, B extends Brand<Base, any, any>>(
  base: t.Type<Base>
) =>
  new t.Type<B>(
    'Branded ID',
    (u): u is B => base.is(u),
    (u, c) => base.validate(u, c) as t.Validation<B>,
    (a) => a
  );

/**
 * Print out io-ts decoding errors in a more user-readable format for use in
 * error messages / debugging
 */
export const ioTsErrorFormatter = (decoded: Left<t.Errors>): string[] =>
  decoded.left.map((error) => {
    const path = error.context
      // Filter out useless / context paths
      .filter((c, i) => {
        const parent: t.ContextEntry | undefined = error.context[i - 1];
        const parentType = (parent?.type as any)?._tag;
        return (
          c.key !== '' &&
          parentType !== 'IntersectionType' &&
          parentType !== 'UnionType'
        );
      })
      .map((c) => c.key)
      .join(' -> ');
    return `Invalid value ${JSON.stringify(error.value)} supplied to ${path}`;
  });
