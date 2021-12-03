import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { CATEGORY_GROUP_TYPE } from './categoryGroup';

export type CategoryId = Brand<
  number,
  { readonly s: unique symbol },
  'category.id'
>;

export const CATEGORY_ID = brandedType<number, CategoryId>(t.number);

export default defineIDModel({
  tableName: 'category',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: CATEGORY_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      group: { kind: 'checked', type: CATEGORY_GROUP_TYPE },
    },
    optional: {
      description: { kind: 'checked', type: t.string },
      parentID: { kind: 'branded-integer', brand: CATEGORY_ID },
      code: { kind: 'checked', type: t.string },
      includeTotals: { kind: 'checked', type: t.boolean },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
