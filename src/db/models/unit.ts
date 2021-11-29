import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { UNIT_TYPE_ID } from './unitType';

export type UnitId = Brand<number, { readonly s: unique symbol }, 'unit.id'>;

export const UNIT_ID = brandedType<number, UnitId>(t.number);

export default defineIDModel({
  tableName: 'unit',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: UNIT_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      label: { kind: 'checked', type: t.string },
      unitTypeId: { kind: 'branded-integer', brand: UNIT_TYPE_ID },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
