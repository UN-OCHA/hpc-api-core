import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type FileAssetEntityId = Brand<
  number,
  { readonly s: unique symbol },
  'fileAssetEntity.id'
>;

export const FILE_ASSET_ENTITY_ID = brandedType<number, FileAssetEntityId>(
  t.number
);
