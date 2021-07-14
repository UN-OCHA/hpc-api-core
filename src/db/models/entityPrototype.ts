import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';

export type EntityPrototypeId = Brand<
  number,
  { readonly s: unique symbol },
  'entityPrototype.id'
>;

export const ENTITY_PROTOTYPE_ID = brandedType<number, EntityPrototypeId>(
  t.number
);
