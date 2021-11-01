import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PLAN_ID } from './plan';

export type WorkflowStatusOptionId = Brand<
  number,
  { readonly s: unique symbol },
  'workflowStatusOption.id'
>;

export const WORKFLOW_STATUS_OPTION_ID = brandedType<
  number,
  WorkflowStatusOptionId
>(t.number);

export const WORKFLOW_STATUS_OPTION_TYPE = t.keyof({
  accepted: null,
  approved: null,
  draft: null,
  hcreviewed: null,
  notSubmitted: null,
  published: null,
  rejected: null,
  returned: null,
  review: null,
  submitted: null,
  submittedForWithdrawal: null,
  withdrawalUnderAck: null,
  withdrawn: null,
});

export const WORKFLOW_STATUS_OPTION_VALUE = t.type({
  label: t.type({
    en: t.string,
  }),
});

export default defineIDModel({
  tableName: 'workflowStatusOption',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: WORKFLOW_STATUS_OPTION_ID,
      },
    },
    accidentallyOptional: {
      value: {
        kind: 'checked',
        type: WORKFLOW_STATUS_OPTION_VALUE,
      },
    },
    required: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
      type: { kind: 'checked', type: WORKFLOW_STATUS_OPTION_TYPE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
