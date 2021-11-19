import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { IATI_ACTIVITY_ID } from './iatiActivity';

export type IatiRecipientCountryId = Brand<
  number,
  { readonly s: unique symbol },
  'iatiRecipientCountry.id'
>;

export const IATI_RECIPIENT_COUNTRY_ID = brandedType<
  number,
  IatiRecipientCountryId
>(t.number);

export default defineIDModel({
  tableName: 'iatiRecipientCountry',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: IATI_RECIPIENT_COUNTRY_ID },
    },
    required: {
      code: { kind: 'checked', type: t.string },
      iatiActivityId: { kind: 'branded-integer', brand: IATI_ACTIVITY_ID },
    },
    optional: {
      iatiIdentifier: { kind: 'checked', type: t.string },
      iso3: { kind: 'checked', type: t.string },
      percentage: { kind: 'checked', type: t.string },
      text: { kind: 'checked', type: t.string },
      isCountry: { kind: 'checked', type: t.boolean },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
