import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { ATTACHMENT_ID } from './attachment';
import { PLAN_REPORTING_PERIOD_ID } from './planReportingPeriod';

export type MeasurementId = Brand<
  number,
  { readonly s: unique symbol },
  'measurement.id'
>;

export const MEASUREMENT_ID = brandedType<number, MeasurementId>(t.number);

export default defineLegacyVersionedModel({
  tableName: 'measurement',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: MEASUREMENT_ID },
    },
    required: {
      attachmentId: { kind: 'branded-integer', brand: ATTACHMENT_ID },
      planReportingPeriodId: {
        kind: 'branded-integer',
        brand: PLAN_REPORTING_PERIOD_ID,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
