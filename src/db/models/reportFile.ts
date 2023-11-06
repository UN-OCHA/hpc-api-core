import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';
import { Brand } from '../../util/types';
import { brandedType } from '../../util/io-ts';
import { FILE_ASSET_ENTITY_ID } from './fileAssetEntity';
import { REPORT_DETAIL_ID } from './reportDetail';

export type ReportFileId = Brand<
  number,
  { readonly s: unique symbol },
  'reportFile.id'
>;

export const REPORT_FILE_TYPE = t.keyof({
  file: null,
  url: null,
});

export const REPORT_FILE_ID = brandedType<number, ReportFileId>(t.number);

export default defineSequelizeModel({
  tableName: 'reportFile',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: REPORT_FILE_ID },
    },
    required: {
      reportID: { kind: 'branded-integer', brand: REPORT_DETAIL_ID },
      title: { kind: 'checked', type: t.string },
      type: { kind: 'checked', type: REPORT_FILE_TYPE },
    },
    optional: {
      url: { kind: 'checked', type: t.string },
      fileAssetID: { kind: 'checked', type: FILE_ASSET_ENTITY_ID },
    },
  },
  softDeletionEnabled: false,
});
