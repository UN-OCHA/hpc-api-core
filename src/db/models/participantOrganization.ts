import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ParticipantOrganizationId = Brand<
  number,
  { readonly s: unique symbol },
  'participantOrganization.id'
>;

export const PARTICIPANT_ORGANIZATION_ID = brandedType<
  number,
  ParticipantOrganizationId
>(t.number);
