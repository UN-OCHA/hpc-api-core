import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PLAN_ID } from './plan';
import { UNIT_TYPE_ID } from './unitType';

export type DisaggregationCategoryGroupId = Brand<
  number,
  { readonly s: unique symbol },
  'disaggregationCategoryGroup.id'
>;

export const DISAGGREGATION_CATEGORY_GROUP_ID = brandedType<
  number,
  DisaggregationCategoryGroupId
>(t.number);

export default defineIDModel({
  tableName: 'disaggregationCategoryGroup',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: DISAGGREGATION_CATEGORY_GROUP_ID },
    },
    required: {
      unitTypeId: { kind: 'branded-integer', brand: UNIT_TYPE_ID },
    },
    optional: {
      name: { kind: 'checked', type: t.string },
      label: { kind: 'checked', type: t.string },
    },
    accidentallyOptional: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
