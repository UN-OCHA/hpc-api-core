import { defineSequelizeModel } from '../util/sequelize-model';
import { CONDITION_FIELD_ID } from './conditionField';

export default defineSequelizeModel({
  tableName: 'conditionFieldReliesOn',
  fields: {
    required: {
      reliedOnById: { kind: 'branded-integer', brand: CONDITION_FIELD_ID },
      reliesOnId: { kind: 'branded-integer', brand: CONDITION_FIELD_ID },
    },
  },
  softDeletionEnabled: false,
});
