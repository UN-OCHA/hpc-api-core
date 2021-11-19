import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PLAN_ID } from './plan';
import { PROJECT_VERSION_ID } from './projectVersion';
import { WORKFLOW_STATUS_OPTION_ID } from './workflowStatusOption';

export type ProjectVersionPlanId = Brand<
  number,
  { readonly s: unique symbol },
  'projectVersionPlan.id'
>;

export const PROJECT_VERSION_PLAN_ID = brandedType<
  number,
  ProjectVersionPlanId
>(t.number);

export default defineIDModel({
  tableName: 'projectVersionPlan',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PROJECT_VERSION_PLAN_ID },
    },
    nonNullWithDefault: {
      value: { kind: 'checked', type: t.unknown },
    },
    required: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
      workflowStatusOptionId: {
        kind: 'branded-integer',
        brand: WORKFLOW_STATUS_OPTION_ID,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
