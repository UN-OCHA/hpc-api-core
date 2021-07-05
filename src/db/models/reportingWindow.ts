import * as t from 'io-ts';

import type { Brand } from '../../util/types';
import { defineVersionedModel } from '../util/versioned-model';
import { brandedType } from '../../util/io-ts';
import { OPERATION_ID } from './operation';

export type ReportingWindowId = Brand<
  number,
  { readonly s: unique symbol },
  'reportingWindow.id'
>;

export const REPORTING_WINDOW_ID = brandedType<number, ReportingWindowId>(
  t.number
);

export const REPORTING_WINDOW_STATE = t.keyof({
  pending: null,
  open: null,
  closed: null,
});

export type ReportingWindowState = t.TypeOf<typeof REPORTING_WINDOW_STATE>;

export const REPORTING_WINDOW_DATA = t.type({
  name: t.string,
  belongsTo: t.union([
    t.type({
      type: t.literal('global'),
    }),
    t.type({
      type: t.literal('operation'),
      operation: OPERATION_ID,
    }),
  ]),
  state: REPORTING_WINDOW_STATE,
});

export default defineVersionedModel({
  tableBaseName: 'reportingWindow',
  idType: REPORTING_WINDOW_ID,
  data: REPORTING_WINDOW_DATA,
  lookupColumns: {
    columns: {
      required: {
        belongsToType: {
          kind: 'enum',
          values: {
            global: null,
            operation: null,
          },
        },
      },
      optional: {
        belongsToId: {
          kind: 'checked',
          type: t.number,
        },
      },
    },
    prepare: async (data) => ({
      belongsToType: data.belongsTo.type,
      belongsToId:
        data.belongsTo.type === 'operation'
          ? data.belongsTo.operation
          : undefined,
    }),
  },
});
