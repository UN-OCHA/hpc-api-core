import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type EmergencyId = Brand<
  number,
  { readonly s: unique symbol },
  'emergency.id'
>;

export const EMERGENCY_ID = brandedType<number, EmergencyId>(t.number);
