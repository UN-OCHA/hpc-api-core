import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type UsageYearId = Brand<
  number,
  { readonly s: unique symbol },
  'usageYear.id'
>;

export const USAGE_YEAR_ID = brandedType<number, UsageYearId>(t.number);
