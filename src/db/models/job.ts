import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { LOCATION_ID } from './location';
import { PARTICIPANT_ID } from './participant';
import { PROJECT_ID } from './project';

export type JobId = Brand<number, { readonly s: unique symbol }, 'job.id'>;

export const JOB_ID = brandedType<number, JobId>(t.number);

export const JOB_STATUS = {
  failed: null,
  pending: null,
  success: null,
};

export const JOB_TYPE = {
  confirmableCommand: null,
  locationImport: null,
  projectExcelGeneration: null,
  projectPdfGeneration: null,
};

const JOB_METADATA_LOCATION_IMPORT = t.type({
  locationId: LOCATION_ID,
  trigger: t.keyof({
    cron: null,
    admin_command: null,
  }),
});

export const PDF_FILE_RECORD = t.type({
  fileHash: t.string,
  name: t.string,
  projectId: PROJECT_ID,
});

export const JOB_METADATA_PROJECT_PDF = t.partial({
  startedBy: PARTICIPANT_ID,
  processed: t.number,
  total: t.number,
  files: t.array(PDF_FILE_RECORD),
});

export const JOB_METADATA_PROJECT_EXCEL = t.partial({
  startedBy: PARTICIPANT_ID,
  fileName: t.string,
});

const JOB_METADATA_CONFIRMABLE_ADMIN_COMMAND = t.type({
  requester: PARTICIPANT_ID,
  command: t.string,
  dataFileHash: t.string,
});

const JOB_METADATA = t.union([
  JOB_METADATA_LOCATION_IMPORT,
  JOB_METADATA_PROJECT_EXCEL,
  JOB_METADATA_PROJECT_PDF,
  JOB_METADATA_CONFIRMABLE_ADMIN_COMMAND,
]);

export default defineIDModel({
  tableName: 'job',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: JOB_ID },
    },
    required: {
      startAt: { kind: 'checked', type: DATE },
      type: { kind: 'enum', values: JOB_TYPE },
      metadata: { kind: 'checked', type: JOB_METADATA },
    },
    nonNullWithDefault: {
      status: { kind: 'enum', values: JOB_STATUS },
    },
    optional: {
      endAt: { kind: 'checked', type: DATE },
      totalTaskCount: { kind: 'checked', type: t.number },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
