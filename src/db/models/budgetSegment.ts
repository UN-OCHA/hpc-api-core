import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type BudgetSegmentId = Brand<
  number,
  { readonly s: unique symbol },
  'budgetSegment.id'
>;

export const BUDGET_SEGMENT_ID = brandedType<number, BudgetSegmentId>(t.number);
