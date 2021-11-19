import * as t from 'io-ts';

import { DATE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { PARTICIPANT_ID } from './participant';
import { PROJECT_ID } from './project';
import { ProjectVersionId, PROJECT_VERSION_ID } from './project';

export { PROJECT_VERSION_ID };
export type { ProjectVersionId };

export default defineIDModel({
  tableName: 'projectVersion',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
    },
    optional: {
      currentRequestedFunds: {
        kind: 'checked',
        type: t.union([t.string, t.number]),
      },
      editorParticipantId: { kind: 'branded-integer', brand: PARTICIPANT_ID },
      endDate: { kind: 'checked', type: DATE },
      objective: { kind: 'checked', type: t.string },
      partners: { kind: 'checked', type: t.string },
      startDate: { kind: 'checked', type: DATE },
      tags: { kind: 'checked', type: t.array(t.string) },
    },
    required: {
      code: { kind: 'checked', type: t.string },
      name: { kind: 'checked', type: t.string },
      projectId: { kind: 'branded-integer', brand: PROJECT_ID },
      version: { kind: 'checked', type: t.number },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
