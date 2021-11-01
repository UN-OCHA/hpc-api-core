import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type WorkflowRoleId = Brand<
  number,
  { readonly s: unique symbol },
  'workflowRole.id'
>;

export const WORKFLOW_ROLE_ID = brandedType<number, WorkflowRoleId>(t.number);
