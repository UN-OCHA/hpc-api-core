import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type LocationId = Brand<
  number,
  { readonly s: unique symbol },
  'location.id'
>;

export const LOCATION_ID = brandedType<number, LocationId>(t.number);

const LOCATION_STATUS = t.keyof({
  active: null,
  expired: null,
});

export default defineIDModel({
  tableName: 'location',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: LOCATION_ID },
    },
    required: {
      status: { kind: 'checked', type: LOCATION_STATUS },
    },
    nonNullWithDefault: {
      itosSync: { kind: 'checked', type: t.boolean },
    },
    optional: {
      externalId: { kind: 'checked', type: t.string },
      name: { kind: 'checked', type: t.string },
      latitude: { kind: 'checked', type: t.number },
      longitude: { kind: 'checked', type: t.number },
      iso3: { kind: 'checked', type: t.string },
      pcode: { kind: 'checked', type: t.string },
      // Even though this column is defined as int8, it is
      // fetched as a string by knex, since it is bigint
      validOn: { kind: 'checked', type: t.string },
      parentId: { kind: 'branded-integer', brand: LOCATION_ID },
    },
    accidentallyOptional: {
      adminLevel: { kind: 'checked', type: t.number },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
