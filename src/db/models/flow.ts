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
    generated: {
      id: { kind: 'branded-integer', brand: FLOW_ID },
    },
    required: {
      amountUSD: { kind: 'checked', type: t.bigint },
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
      origAmount: { kind: 'checked', type: t.bigint },
      origCurrency: { kind: 'checked', type: t.string },
      exchangeRate: { kind: 'checked', type: t.number },
      description: { kind: 'checked', type: t.string },
      notes: { kind: 'checked', type: t.string },
      versionStartDate: { kind: 'checked', type: DATE },
      versionEndDate: { kind: 'checked', type: DATE },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
