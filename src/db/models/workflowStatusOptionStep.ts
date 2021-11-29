import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { LOCALIZED_STRING } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { WORKFLOW_STATUS_OPTION_ID } from './workflowStatusOption';

export type WorkflowStatusOptionStepId = Brand<
  number,
  { readonly s: unique symbol },
  'workflowStatusOptionStep.id'
>;

export const WORKFLOW_STATUS_OPTION_STEP_ID = brandedType<
  number,
  WorkflowStatusOptionStepId
>(t.number);

export const WORKFLOW_STATUS_OPTION_STEP_VALUE = t.intersection([
  t.type({
    label: LOCALIZED_STRING,
  }),
  t.partial({
    optionConsensus: t.boolean,
  }),
]);

export default defineIDModel({
  tableName: 'workflowStatusOptionStep',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: WORKFLOW_STATUS_OPTION_STEP_ID },
    },
    required: {
      fromId: { kind: 'branded-integer', brand: WORKFLOW_STATUS_OPTION_ID },
      toId: { kind: 'branded-integer', brand: WORKFLOW_STATUS_OPTION_ID },
      value: { kind: 'checked', type: WORKFLOW_STATUS_OPTION_STEP_VALUE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
