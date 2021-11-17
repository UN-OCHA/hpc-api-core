import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';

export const CONDITION_FIELD_TYPE_TYPE = t.keyof({
  checkbox: null,
  number: null,
  select: null,
  text: null,
  textarea: null,
});

export default defineSequelizeModel({
  tableName: 'conditionFieldType',
  fields: {
    required: {
      /*
       * Don't constraint to CONDITION_FIELD_TYPE_TYPE, in order
       * to allow new condition field types to be created
       */
      type: { kind: 'checked', type: t.string },
    },
  },
  softDeletionEnabled: false,
});
