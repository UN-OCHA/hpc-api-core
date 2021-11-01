import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ParticipantCountryId = Brand<
  number,
  { readonly s: unique symbol },
  'participantCountry.id'
>;

export const PARTICIPANT_COUNTRY_ID = brandedType<number, ParticipantCountryId>(
  t.number
);
