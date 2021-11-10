import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PARTICIPANT_ID } from './participant';
import { PROJECT_VERSION_ID } from './project';
import { WORKFLOW_STATUS_OPTION_ID } from './workflowStatusOption';

export type ProjectVersionHistoryId = Brand<
  number,
  { readonly s: unique symbol },
  'projectVersionHistory.id'
>;

export const PROJECT_VERSION_HISTORY_ID = brandedType<
  number,
  ProjectVersionHistoryId
>(t.number);

const PROJECT_VERSION_HISTORY_VALUE = t.type({
  action: t.literal('moveToStep'),
  workflowStatusOptionId: WORKFLOW_STATUS_OPTION_ID,
});

export default defineIDModel({
  tableName: 'projectVersionHistory',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PROJECT_VERSION_HISTORY_ID },
    },
    required: {
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
      participantId: { kind: 'branded-integer', brand: PARTICIPANT_ID },
    },
    accidentallyOptional: {
      value: { kind: 'checked', type: PROJECT_VERSION_HISTORY_VALUE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
