import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type FileAssetEntityId = Brand<
  number,
  { readonly s: unique symbol },
  'fileAssetEntity.id'
>;

export const FILE_ASSET_ENTITY_ID = brandedType<number, FileAssetEntityId>(
  t.number
);

export const FILE_ASSET_ENTITY_MIME_TYPE = t.keyof({
  'application/zip': null,
  'application/pdf': null,
  'image/png': null,
  'application/vnd.ms-excel': null,
  'text/csv': null,
  'text/plain': null,
  'application/octet-stream': null,
  'image/gif': null,
  'text/xml': null,
  'application/msword': null,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': null,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    null,
  'image/jpeg': null,
});

export default defineIDModel({
  tableName: 'fileAssetEntity',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: FILE_ASSET_ENTITY_ID },
    },
    required: {
      filename: { kind: 'checked', type: t.string },
      originalname: { kind: 'checked', type: t.string },
      /*
       * Don't use FILE_ASSET_ENTITY_MIME_TYPE to allow for new file
       * types, but this field should be validated using FILE_ASSET_ENTITY_MIME_TYPE
       */
      mimetype: { kind: 'checked', type: t.string },
      path: { kind: 'checked', type: t.string },
      collection: { kind: 'checked', type: t.string },
    },
    optional: {
      size: { kind: 'checked', type: t.number },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
