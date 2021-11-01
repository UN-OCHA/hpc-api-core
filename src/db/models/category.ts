import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type CategoryId = Brand<
  number,
  { readonly s: unique symbol },
  'category.id'
>;

export const CATEGORY_ID = brandedType<number, CategoryId>(t.number);
