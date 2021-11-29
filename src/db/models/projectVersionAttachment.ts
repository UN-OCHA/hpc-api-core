import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';
import { PROJECT_VERSION_ID } from './projectVersion';
import { ATTACHMENT_ID } from './attachment';
import { ATTACHMENT_VERSION_ID } from './attachmentVersion';

export const PROJECT_VERSION_ATTACHMENT_VALUE = t.type({
  targets: t.union([
    t.null,
    t.array(t.array(t.union([t.string, t.number, t.null]))),
  ]),
});

export type ProjectVersionAttachmentValue = t.TypeOf<
  typeof PROJECT_VERSION_ATTACHMENT_VALUE
>;

export default defineSequelizeModel({
  tableName: 'projectVersionAttachment',
  fields: {
    optional: {
      value: { kind: 'checked', type: PROJECT_VERSION_ATTACHMENT_VALUE },
      total: { kind: 'checked', type: t.number },
    },
    required: {
      attachmentVersionId: {
        kind: 'branded-integer',
        brand: ATTACHMENT_VERSION_ID,
      },
      attachmentId: { kind: 'branded-integer', brand: ATTACHMENT_ID },
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
    },
  },
  softDeletionEnabled: false,
});
