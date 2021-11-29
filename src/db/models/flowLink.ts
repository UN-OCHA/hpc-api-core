import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';
import { FLOW_ID } from './flow';

export default defineSequelizeModel({
  tableName: 'flowLink',
  fields: {
    required: {
      parentID: { kind: 'branded-integer', brand: FLOW_ID },
      childID: { kind: 'branded-integer', brand: FLOW_ID },
      depth: { kind: 'checked', type: t.number },
    },
  },
  softDeletionEnabled: false,
});
