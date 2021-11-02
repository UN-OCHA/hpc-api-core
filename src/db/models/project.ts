import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { FILE_REFERENCE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { PARTICIPANT_ID } from './participant';

export type ProjectId = Brand<
  number,
  { readonly s: unique symbol },
  'project.id'
>;

export const PROJECT_ID = brandedType<number, ProjectId>(t.number);

/**
 * Needs to be defined in this module to prevent circular dependency
 */
export type ProjectVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'projectVersion.id'
>;

/**
 * Needs to be defined in this module to prevent circular dependency
 */
export const PROJECT_VERSION_ID = brandedType<number, ProjectVersionId>(
  t.number
);

const PROJECT_IMPLEMENTATION_STATUS = {
  Planning: null,
  Implementing: null,
  'Ended - Completed': null,
  'Ended - Terminated': null,
  'Ended - Not started and abandoned': null,
};

const PROJECT_PDF_ENTRY = t.type({
  /**
   * TODO: use something more stable, like UNIX OFFSET as a number
   *
   * (this was previously incorrectly typed as DATE, when using the previous
   * library, which didn't do runtime type-validation of the data, meaning that
   * we were handling strings but assuming they were dates. Expiration code
   * around pdf generation is probably broken as a result)
   */
  generatedAt: t.union([t.string, t.number]),
  file: FILE_REFERENCE,
});

export const PROJECT_PDF = t.partial({
  anonymous: PROJECT_PDF_ENTRY,
  withComments: PROJECT_PDF_ENTRY,
  commentsOnly: PROJECT_PDF_ENTRY,
});

export default defineIDModel({
  tableName: 'project',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: PROJECT_ID,
      },
    },
    optional: {
      code: { kind: 'checked', type: t.string },
      implementationStatus: {
        kind: 'enum',
        values: PROJECT_IMPLEMENTATION_STATUS,
      },
      currentPublishedVersionId: {
        kind: 'branded-integer',
        brand: PROJECT_VERSION_ID,
      },
      creatorParticipantId: { kind: 'branded-integer', brand: PARTICIPANT_ID },
      latestVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
      pdf: { kind: 'checked', type: PROJECT_PDF },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
