import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type PlanReportingPeriodId = Brand<
  number,
  { readonly s: unique symbol },
  'planReportingPeriod.id'
>;

export const PLAN_REPORTING_PERIOD_ID = brandedType<
  number,
  PlanReportingPeriodId
>(t.number);
