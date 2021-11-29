import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type CurrencyId = Brand<
  number,
  { readonly s: unique symbol },
  'currency.id'
>;

export const CURRENCY_ID = brandedType<number, CurrencyId>(t.number);

export default defineIDModel({
  tableName: 'currency',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: CURRENCY_ID },
    },
    required: {
      code: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
