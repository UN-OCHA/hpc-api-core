import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type WorkflowStatusOptionId = Brand<
  number,
  { readonly s: unique symbol },
  'workflowStatusOption.id'
>;

export const WORKFLOW_STATUS_OPTION_ID = brandedType<
  number,
  WorkflowStatusOptionId
>(t.number);
