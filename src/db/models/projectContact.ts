import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PARTICIPANT_ID } from './participant';
import { PROJECT_VERSION_ID } from './project';

export type ProjectContactId = Brand<
  number,
  { readonly s: unique symbol },
  'projectContact.id'
>;

export const PROJECT_CONTACT_ID = brandedType<number, ProjectContactId>(
  t.number
);

export default defineIDModel({
  tableName: 'projectContact',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PROJECT_CONTACT_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
    },
    accidentallyOptional: {
      email: { kind: 'checked', type: t.string },
      phoneNumber: { kind: 'checked', type: t.string },
    },
    optional: {
      website: { kind: 'checked', type: t.string },
      participantId: { kind: 'branded-integer', brand: PARTICIPANT_ID },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
