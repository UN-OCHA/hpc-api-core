import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ProjectVersionHistoryId = Brand<
  number,
  { readonly s: unique symbol },
  'projectVersionHistory.id'
>;

export const PROJECT_VERSION_HISTORY_ID = brandedType<
  number,
  ProjectVersionHistoryId
>(t.number);
