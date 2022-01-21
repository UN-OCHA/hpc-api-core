import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { PLAN_ID } from './plan';
import { USAGE_YEAR_ID } from './usageYear';

export type PlanYearId = Brand<
  number,
  { readonly s: unique symbol },
  'planYear.id'
>;

export const PLAN_YEAR_ID = brandedType<number, PlanYearId>(t.number);

export default defineLegacyVersionedModel({
  tableName: 'planYear',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PLAN_YEAR_ID },
    },
    required: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
      usageYearId: { kind: 'branded-integer', brand: USAGE_YEAR_ID },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
