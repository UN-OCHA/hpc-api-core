import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type GlobalIndicatorId = Brand<
  number,
  { readonly s: unique symbol },
  'globalIndicator.id'
>;

export const GLOBAL_INDICATOR_ID = brandedType<number, GlobalIndicatorId>(
  t.number
);

export default defineIDModel({
  tableName: 'globalIndicator',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: GLOBAL_INDICATOR_ID },
    },
    required: {
      hrinfoId: { kind: 'checked', type: t.number },
      label: { kind: 'checked', type: t.string },
      subDomain: { kind: 'checked', type: t.string },
      code: { kind: 'checked', type: t.string },
      unit: { kind: 'checked', type: t.string },
      searchData: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
