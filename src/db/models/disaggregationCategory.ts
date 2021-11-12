import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { DISAGGREGATION_CATEGORY_GROUP_ID } from './disaggregationCategoryGroup';

export type DisaggregationCategoryId = Brand<
  number,
  { readonly s: unique symbol },
  'disaggregationCategory.id'
>;

export const DISAGGREGATION_CATEGORY_ID = brandedType<
  number,
  DisaggregationCategoryId
>(t.number);

export default defineIDModel({
  tableName: 'disaggregationCategory',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: DISAGGREGATION_CATEGORY_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      label: { kind: 'checked', type: t.string },
      disaggregationCategoryGroupId: {
        kind: 'branded-integer',
        brand: DISAGGREGATION_CATEGORY_GROUP_ID,
      },
    },
    optional: {
      tagHxl: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
