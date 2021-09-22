import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type ParticipantId = Brand<
  number,
  { readonly s: unique symbol },
  'participant.id'
>;

export const PARTICIPANT_ID = brandedType<number, ParticipantId>(t.number);

export default defineIDModel({
  tableName: 'participant',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PARTICIPANT_ID },
    },
    optional: {
      hidId: { kind: 'checked', type: t.string },
      hidSub: { kind: 'checked', type: t.string },
      email: { kind: 'checked', type: t.string },
      name: { kind: 'checked', type: t.string },
      internalUse: { kind: 'checked', type: t.string },
    },
    required: {},
  },
  idField: 'id',
  softDeletionEnabled: false,
});
