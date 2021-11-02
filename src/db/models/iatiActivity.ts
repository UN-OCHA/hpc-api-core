import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type IatiActivityId = Brand<
  number,
  { readonly s: unique symbol },
  'iatiActivity.id'
>;

export const IATI_ACTIVITY_ID = brandedType<number, IatiActivityId>(t.number);
