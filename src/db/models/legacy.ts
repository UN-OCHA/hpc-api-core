import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';
import { FLOW_OBJECT_TYPE_TYPE } from './flowObjectType';

export default defineSequelizeModel({
  tableName: 'legacy',
  fields: {
    required: {
      objectType: { kind: 'checked', type: FLOW_OBJECT_TYPE_TYPE },
      objectID: { kind: 'checked', type: t.number },
      legacyID: { kind: 'checked', type: t.number },
    },
  },
  softDeletionEnabled: false,
});
