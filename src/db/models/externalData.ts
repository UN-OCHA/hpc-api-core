import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ExternalDataId = Brand<
  number,
  { readonly s: unique symbol },
  'externalData.id'
>;

export const EXTERNAL_DATA_ID = brandedType<number, ExternalDataId>(t.number);
