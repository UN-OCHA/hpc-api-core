import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { PLAN_ID } from './plan';
import { PLAN_REPORTING_PERIOD_ID } from './planReportingPeriod';

export type PlanVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'planVersion.id'
>;

export const PLAN_VERSION_ID = brandedType<number, PlanVersionId>(t.number);

const PLAN_VERSION_CLUSTER_SELECTION_TYPE = {
  single: null,
  multi: null,
};

export default defineLegacyVersionedModel({
  tableName: 'planVersion',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PLAN_VERSION_ID },
    },
    nonNullWithDefault: {
      isForHPCProjects: { kind: 'checked', type: t.boolean },
    },
    accidentallyOptional: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
      name: { kind: 'checked', type: t.string },
      startDate: { kind: 'checked', type: DATE },
      endDate: { kind: 'checked', type: DATE },
    },
    optional: {
      comments: { kind: 'checked', type: t.string },
      code: { kind: 'checked', type: t.string },
      customLocationCode: { kind: 'checked', type: t.string },
      currentReportingPeriodId: {
        kind: 'branded-integer',
        brand: PLAN_REPORTING_PERIOD_ID,
      },
      lastPublishedReportingPeriodId: { kind: 'checked', type: t.number },
      // Even though this column isn't defined using DB enum only two values are used
      clusterSelectionType: {
        kind: 'enum',
        values: PLAN_VERSION_CLUSTER_SELECTION_TYPE,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
