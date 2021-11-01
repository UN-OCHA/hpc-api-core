import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type WorkflowStatusOptionStepId = Brand<
  number,
  { readonly s: unique symbol },
  'workflowStatusOptionStep.id'
>;

export const WORKFLOW_STATUS_OPTION_STEP_ID = brandedType<
  number,
  WorkflowStatusOptionStepId
>(t.number);
