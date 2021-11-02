import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type LocationId = Brand<
  number,
  { readonly s: unique symbol },
  'location.id'
>;

export const LOCATION_ID = brandedType<number, LocationId>(t.number);
