import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';

export type EmergencyId = Brand<
  number,
  { readonly s: unique symbol },
  'emergency.id'
>;

export const EMERGENCY_ID = brandedType<number, EmergencyId>(t.number);

export default defineIDModel({
  tableName: 'emergency',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: EMERGENCY_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      date: { kind: 'checked', type: DATE },
      restricted: { kind: 'checked', type: t.boolean },
    },
    nonNullWithDefault: {
      active: { kind: 'checked', type: t.boolean },
    },
    optional: { description: { kind: 'checked', type: t.string } },
    accidentallyOptional: {
      glideId: { kind: 'checked', type: t.string },
      levelThree: { kind: 'checked', type: t.boolean },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
