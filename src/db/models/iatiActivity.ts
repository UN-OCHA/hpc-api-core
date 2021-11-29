import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { IATI_PUBLISHER_ID } from './iatiPublisher';

export type IatiActivityId = Brand<
  number,
  { readonly s: unique symbol },
  'iatiActivity.id'
>;

export const IATI_ACTIVITY_ID = brandedType<number, IatiActivityId>(t.number);

export const IATY_ACTIVITY_CURRENCY = t.keyof({
  GBP: null,
  EUR: null,
  USD: null,
});

export default defineIDModel({
  tableName: 'iatiActivity',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: IATI_ACTIVITY_ID },
    },
    required: {
      iatiIdentifier: { kind: 'checked', type: t.string },
      title: { kind: 'checked', type: t.string },
      version: { kind: 'checked', type: t.string },
      startDate: { kind: 'checked', type: DATE },
      description: { kind: 'checked', type: DATE },
      reportingOrgRef: { kind: 'checked', type: t.string },
      reportingOrgName: { kind: 'checked', type: t.string },
      hash: { kind: 'checked', type: t.string },
      lastUpdatedAt: { kind: 'checked', type: DATE },
      iatiPublisherId: { kind: 'branded-integer', brand: IATI_PUBLISHER_ID },
    },
    nonNullWithDefault: {
      humanitarian: { kind: 'checked', type: t.boolean },
      iatiHumanitarian: { kind: 'checked', type: t.boolean },
      updatedStatus: { kind: 'checked', type: t.boolean },
      viewed: { kind: 'checked', type: t.boolean },
    },
    accidentallyOptional: {
      endDate: { kind: 'checked', type: DATE },
    },
    optional: {
      /**
       * Not defined with `IATY_ACTIVITY_CURRENCY`, because we want
       * to allow using other currencies as well, but this column
       * should be verified by `IATY_ACTIVITY_CURRENCY` when read
       */
      currency: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
