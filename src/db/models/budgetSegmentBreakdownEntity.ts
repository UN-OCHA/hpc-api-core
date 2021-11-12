import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { BUDGET_SEGMENT_BREAKDOWN_ID } from './budgetSegmentBreakdown';

export type BudgetSegmentBreakdownEntityId = Brand<
  number,
  { readonly s: unique symbol },
  'budgetSegmentBreakdownEntity.id'
>;

export const BUDGET_SEGMENT_BREAKDOWN_ENTITY_ID = brandedType<
  number,
  BudgetSegmentBreakdownEntityId
>(t.number);

export const BUDGET_OBJECT_TYPE = t.keyof({
  globalCluster: null,
  governingEntity: null,
  organization: null,
  projectVersion: null,
});

export default defineIDModel({
  tableName: 'budgetSegmentBreakdownEntity',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: BUDGET_SEGMENT_BREAKDOWN_ENTITY_ID,
      },
    },
    required: {
      budgetSegmentBreakdownId: {
        kind: 'branded-integer',
        brand: BUDGET_SEGMENT_BREAKDOWN_ID,
      },
      objectType: { kind: 'checked', type: BUDGET_OBJECT_TYPE },
      objectId: { kind: 'checked', type: t.number },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
