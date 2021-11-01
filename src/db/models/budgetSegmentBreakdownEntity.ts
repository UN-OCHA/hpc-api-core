import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type BudgetSegmentBreakdownEntityId = Brand<
  number,
  { readonly s: unique symbol },
  'budgetSegmentBreakdownEntity.id'
>;

export const BUDGET_SEGMENT_BREAKDOWN_ENTITY_ID = brandedType<
  number,
  BudgetSegmentBreakdownEntityId
>(t.number);
