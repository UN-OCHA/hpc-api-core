import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { type Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineSequelizeModel } from '../util/sequelize-model';
import { FLOW_ID } from './flow';
import { ORGANIZATION_ID } from './organization';

export type ReportDetailId = Brand<
  number,
  { readonly s: unique symbol },
  'reportDetail.id'
>;

export const REPORT_DETAIL_ID = brandedType<number, ReportDetailId>(t.number);

export default defineSequelizeModel({
  tableName: 'reportDetail',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: REPORT_DETAIL_ID },
    },
    required: {
      flowID: { kind: 'branded-integer', brand: FLOW_ID },
      source: { kind: 'checked', type: t.string },
    },
    nonNullWithDefault: {
      versionID: { kind: 'checked', type: t.number },
      verified: { kind: 'checked', type: t.boolean },
    },
    optional: {
      contactInfo: { kind: 'checked', type: t.string },
      date: { kind: 'checked', type: DATE },
      sourceID: { kind: 'checked', type: t.string },
      refCode: { kind: 'checked', type: t.string },
      organizationID: { kind: 'checked', type: ORGANIZATION_ID },
    },
  },
  softDeletionEnabled: false,
});
