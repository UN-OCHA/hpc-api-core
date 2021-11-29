import { defineSequelizeModel } from '../util/sequelize-model';
import { EMERGENCY_ID } from './emergency';
import { LOCATION_ID } from './location';

export default defineSequelizeModel({
  tableName: 'emergencyLocation',
  fields: {
    required: {
      emergencyId: { kind: 'branded-integer', brand: EMERGENCY_ID },
      locationId: { kind: 'branded-integer', brand: LOCATION_ID },
    },
  },
  softDeletionEnabled: false,
});
