import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { PLAN_ID } from './plan';

export type PlanReportingPeriodId = Brand<
  number,
  { readonly s: unique symbol },
  'planReportingPeriod.id'
>;

export const PLAN_REPORTING_PERIOD_ID = brandedType<
  number,
  PlanReportingPeriodId
>(t.number);

export default defineIDModel({
  tableName: 'planReportingPeriod',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PLAN_REPORTING_PERIOD_ID },
    },
    nonNullWithDefault: {
      measurementsGenerated: { kind: 'checked', type: t.boolean },
    },
    accidentallyOptional: {
      startDate: { kind: 'checked', type: DATE },
      endDate: { kind: 'checked', type: DATE },
      periodNumber: { kind: 'checked', type: t.number },
      planId: { kind: 'branded-integer', brand: PLAN_ID },
    },
    optional: {
      expiryDate: { kind: 'checked', type: DATE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
