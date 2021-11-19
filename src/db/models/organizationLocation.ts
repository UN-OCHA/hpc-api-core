import { defineSequelizeModel } from '../util/sequelize-model';
import { LOCATION_ID } from './location';
import { ORGANIZATION_ID } from './organization';

export default defineSequelizeModel({
  tableName: 'organizationLocation',
  fields: {
    required: {
      organizationId: { kind: 'branded-integer', brand: ORGANIZATION_ID },
      locationId: { kind: 'branded-integer', brand: LOCATION_ID },
    },
  },
  softDeletionEnabled: false,
});
