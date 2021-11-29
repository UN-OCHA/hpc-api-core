import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type IatiFTSMapId = Brand<
  number,
  { readonly s: unique symbol },
  'iatiFTSMap.id'
>;

export const IATI_FTS_MAP_ID = brandedType<number, IatiFTSMapId>(t.number);
