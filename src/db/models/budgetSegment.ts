import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PROJECT_VERSION_ID } from './project';

export type BudgetSegmentId = Brand<
  number,
  { readonly s: unique symbol },
  'budgetSegment.id'
>;

export const BUDGET_SEGMENT_ID = brandedType<number, BudgetSegmentId>(t.number);

export default defineIDModel({
  tableName: 'budgetSegment',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: BUDGET_SEGMENT_ID },
    },
    required: {
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
      name: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
