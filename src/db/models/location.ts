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

export const LOCATION_STATUS = t.keyof({
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
      latitude: { kind: 'checked', type: t.number },
      longitude: { kind: 'checked', type: t.number },
      iso3: { kind: 'checked', type: t.string },
      pcode: { kind: 'checked', type: t.string },
      /**
       * Union type of string and number is used because int8 (bigint)
       * DB type is read as string, but when inserting rows, we don't want
       * library clients to provide numbers as strings.
       *
       * TODO: Add the possibility to define separate types for reading
       * and writing, then use string for reading and number for writing
       */
      validOn: { kind: 'checked', type: t.union([t.string, t.number]) },
      parentId: { kind: 'branded-integer', brand: LOCATION_ID },
    },
    accidentallyOptional: {
      name: { kind: 'checked', type: t.string },
      adminLevel: { kind: 'checked', type: t.number },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
