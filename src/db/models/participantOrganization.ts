import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { ORGANIZATION_ID } from './organization';
import { PARTICIPANT_ID } from './participant';

export type ParticipantOrganizationId = Brand<
  number,
  { readonly s: unique symbol },
  'participantOrganization.id'
>;

export const PARTICIPANT_ORGANIZATION_ID = brandedType<
  number,
  ParticipantOrganizationId
>(t.number);

export default defineIDModel({
  tableName: 'participantOrganization',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PARTICIPANT_ORGANIZATION_ID },
    },
    required: {
      organizationId: { kind: 'branded-integer', brand: ORGANIZATION_ID },
      participantId: { kind: 'branded-integer', brand: PARTICIPANT_ID },
    },
    nonNullWithDefault: {
      validated: { kind: 'checked', type: t.boolean },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
