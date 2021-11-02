import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type BudgetSegmentBreakdownId = Brand<
  number,
  { readonly s: unique symbol },
  'budgetSegmentBreakdown.id'
>;

export const BUDGET_SEGMENT_BREAKDOWN_ID = brandedType<
  number,
  BudgetSegmentBreakdownId
>(t.number);
