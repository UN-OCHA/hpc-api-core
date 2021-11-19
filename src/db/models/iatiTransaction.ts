import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { IATI_ACTIVITY_ID } from './iatiActivity';
import { IATI_FTS_MAP_ID } from './iatiFTSMap';

export type IatiTransactionId = Brand<
  number,
  { readonly s: unique symbol },
  'iatiTransaction.id'
>;

export const IATI_TRANSACTION_ID = brandedType<number, IatiTransactionId>(
  t.number
);

export const IATI_TRANSACTION_SECTOR = t.array(
  t.type({
    code: t.string,
    vocabulary: t.string,
    text: t.string,
  })
);

export const IATI_TRANSACTION_TYPE = t.keyof({
  Disbursement: null,
  'Incoming Commitment': null,
  'Incoming Funds': null,
  'Outgoing Commitment': null,
});

export const IATI_TRANSACTION_RECIPIENT_COUNTRY = t.array(
  t.partial({
    code: t.string,
    iso3: t.string,
    text: t.string,
  })
);

export default defineIDModel({
  tableName: 'iatiTransaction',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: IATI_TRANSACTION_ID },
    },
    required: {
      iatiIdentifier: { kind: 'checked', type: t.string },
      sector: { kind: 'checked', type: IATI_TRANSACTION_SECTOR },
      date: { kind: 'checked', type: t.string },
      type: { kind: 'checked', type: IATI_TRANSACTION_TYPE },
      value: { kind: 'checked', type: t.number },
      providerOrgName: { kind: 'checked', type: t.string },
      receiverOrgName: { kind: 'checked', type: t.string },
      recipientCountry: {
        kind: 'checked',
        type: IATI_TRANSACTION_RECIPIENT_COUNTRY,
      },
      iatiActivityId: { kind: 'branded-integer', brand: IATI_ACTIVITY_ID },
      description: { kind: 'checked', type: t.string },
    },
    nonNullWithDefault: {
      humanitarian: { kind: 'checked', type: t.boolean },
    },
    optional: {
      ref: { kind: 'checked', type: t.string },
      currency: { kind: 'checked', type: t.string },
      providerOrgRef: { kind: 'checked', type: t.string },
      receiverOrgRef: { kind: 'checked', type: t.string },
      iatiFTSMapId: { kind: 'branded-integer', brand: IATI_FTS_MAP_ID },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
