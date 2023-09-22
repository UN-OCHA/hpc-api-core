import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';

export type FlowId = Brand<number, { readonly s: unique symbol }, 'flow.id'>;

export const FLOW_ID = brandedType<number, FlowId>(t.number);

export default defineIDModel({
  tableName: 'flow',
  fields: {
    generatedCompositeKey: {
      id: { kind: 'branded-integer', brand: FLOW_ID },
    },
    required: {
      /**
       * Union type of string and number is used because int8 (bigint)
       * DB type is read as string, but when inserting rows, we don't want
       * library clients to provide numbers as strings.
       *
       * TODO: Add the possibility to define separate types for reading
       * and writing, then use string for reading and number for writing
       */
      amountUSD: { kind: 'checked', type: t.union([t.string, t.number]) },
    },
    nonNullWithDefault: {
      versionID: { kind: 'checked', type: t.number },
      activeStatus: { kind: 'checked', type: t.boolean },
      restricted: { kind: 'checked', type: t.boolean },
      newMoney: { kind: 'checked', type: t.boolean },
    },
    optional: {
      flowDate: { kind: 'checked', type: DATE },
      decisionDate: { kind: 'checked', type: DATE },
      firstReportedDate: { kind: 'checked', type: DATE },
      budgetYear: { kind: 'checked', type: t.string },
      /**
       * Union type of string and number is used because int8 (bigint)
       * DB type is read as string, but when inserting rows, we don't want
       * library clients to provide numbers as strings.
       *
       * TODO: Add the possibility to define separate types for reading
       * and writing, then use string for reading and number for writing
       */
      origAmount: { kind: 'checked', type: t.union([t.string, t.number]) },
      origCurrency: { kind: 'checked', type: t.string },
      /**
       * Union type of string and number is used because numeric DB type
       * is read as string, but when inserting rows, we don't want
       * library clients to provide numbers as strings.
       *
       * TODO: Add the possibility to define separate types for reading
       * and writing, then use string for reading and number for writing
       */
      exchangeRate: { kind: 'checked', type: t.union([t.string, t.number]) },
      description: { kind: 'checked', type: t.string },
      notes: { kind: 'checked', type: t.string },
      versionStartDate: { kind: 'checked', type: DATE },
      versionEndDate: { kind: 'checked', type: DATE },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
