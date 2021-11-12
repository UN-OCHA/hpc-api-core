import * as t from 'io-ts';
import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type UnitTypeId = Brand<
  number,
  { readonly s: unique symbol },
  'unitType.id'
>;

export const UNIT_TYPE_ID = brandedType<number, UnitTypeId>(t.number);

export default defineIDModel({
  tableName: 'unitType',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: UNIT_TYPE_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      label: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
