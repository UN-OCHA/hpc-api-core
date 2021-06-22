import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';

export type ParticipantId = Brand<
  number,
  { readonly s: unique symbol },
  'participant.id'
>;

export const PARTICIPANT_ID = brandedType<number, ParticipantId>(t.number);
