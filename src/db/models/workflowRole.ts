import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { ROLE_ID } from './role';
export type WorkflowRoleId = Brand<
  number,
  { readonly s: unique symbol },
  'workflowRole.id'
>;

export const WORKFLOW_ROLE_ID = brandedType<number, WorkflowRoleId>(t.number);

// export const PERMITTED_ACTION_IDS = t.union([
//   t.tuple([t.literal('moveToStep')]),
//   t.tuple([t.literal('updateProject')]),
// ]);

export const WORKFLOW_ENTITY_TYPE = t.keyof({
  workflowStatusOptionStep: null,
  workflowStatusOption: null,
});

export default defineIDModel({
  tableName: 'workflowRole',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: WORKFLOW_ROLE_ID },
    },
    required: {
      roleId: { kind: 'branded-integer', brand: ROLE_ID },
      entityType: { kind: 'checked', type: WORKFLOW_ENTITY_TYPE },
      entityId: { kind: 'checked', type: t.number },
      permittedActionIds: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
