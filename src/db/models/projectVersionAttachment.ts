import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';
import { PROJECT_VERSION_ID } from './projectVersion';
import { ATTACHMENT_ID } from './attachment';
import { ATTACHMENT_VERSION_ID } from './attachmentVersion';

export default defineSequelizeModel({
  tableName: 'projectVersionAttachment',
  fields: {
    accidentallyOptional: {
      attachmentVersionId: {
        kind: 'branded-integer',
        brand: ATTACHMENT_VERSION_ID,
      },
      value: { kind: 'checked', type: t.unknown },
      total: { kind: 'checked', type: t.number },
    },
    required: {
      attachmentId: { kind: 'branded-integer', brand: ATTACHMENT_ID },
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
    },
  },
  softDeletionEnabled: false,
});
