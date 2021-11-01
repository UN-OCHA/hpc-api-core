import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type GoverningEntityVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'governingEntityVersion.id'
>;

export const GOVERNING_ENTITY_VERSION_ID = brandedType<
  number,
  GoverningEntityVersionId
>(t.number);
