import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';

export type GoverningEntityId = Brand<
  number,
  { readonly s: unique symbol },
  'governingEntity.id'
>;

export const GOVERNING_ENTITY_ID = brandedType<number, GoverningEntityId>(
  t.number
);
