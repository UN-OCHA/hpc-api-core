import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type PlanYearId = Brand<
  number,
  { readonly s: unique symbol },
  'planYear.id'
>;

export const PLAN_YEAR_ID = brandedType<number, PlanYearId>(t.number);
