import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { PARTICIPANT_ID } from './participant';
import { PROJECT_ID } from './project';

export type ProjectVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'projectVersion.id'
>;

export const PROJECT_VERSION_ID = brandedType<number, ProjectVersionId>(
  t.number
);

export default defineIDModel({
  tableName: 'projectVersion',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
    },
    accidentallyOptional: {
      code: { kind: 'checked', type: t.string },
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
      name: { kind: 'checked', type: t.string },
      projectId: { kind: 'branded-integer', brand: PROJECT_ID },
      version: { kind: 'checked', type: t.number },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
