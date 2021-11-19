import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { LOCATION_ID } from './location';
import { PARTICIPANT_ID } from './participant';

export type ParticipantCountryId = Brand<
  number,
  { readonly s: unique symbol },
  'participantCountry.id'
>;

export const PARTICIPANT_COUNTRY_ID = brandedType<number, ParticipantCountryId>(
  t.number
);

export default defineIDModel({
  tableName: 'participantCountry',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PARTICIPANT_COUNTRY_ID },
    },
    required: {
      locationId: { kind: 'branded-integer', brand: LOCATION_ID },
      participantId: { kind: 'branded-integer', brand: PARTICIPANT_ID },
    },
    nonNullWithDefault: {
      validated: { kind: 'checked', type: t.boolean },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
