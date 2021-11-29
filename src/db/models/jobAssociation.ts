import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';
import { JOB_ID } from './job';

export default defineSequelizeModel({
  tableName: 'jobAssociation',
  fields: {
    required: {
      jobId: { kind: 'branded-integer', brand: JOB_ID },
      objectId: { kind: 'checked', type: t.number },
      objectType: { kind: 'checked', type: t.string },
    },
  },
  softDeletionEnabled: false,
});
