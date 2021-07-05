import * as t from 'io-ts';
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
