import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type UsageYearId = Brand<
  number,
  { readonly s: unique symbol },
  'usageYear.id'
>;

export const USAGE_YEAR_ID = brandedType<number, UsageYearId>(t.number);

export default defineIDModel({
  tableName: 'usageYear',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: USAGE_YEAR_ID },
    },
    required: {
      year: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
