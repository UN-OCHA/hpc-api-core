import { defineSequelizeModel } from '../util/sequelize-model';
import { EMERGENCY_ID } from './emergency';
import { PLAN_ID } from './plan';

export default defineSequelizeModel({
  tableName: 'planEmergency',
  fields: {
    required: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
      emergencyId: { kind: 'branded-integer', brand: EMERGENCY_ID },
    },
  },
  softDeletionEnabled: false,
});
