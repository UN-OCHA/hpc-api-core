import { defineSequelizeModel } from '../util/sequelize-model';
import { LOCATION_ID } from './location';
import { PROJECT_VERSION_ID } from './project';

export default defineSequelizeModel({
  tableName: 'projectLocations',
  fields: {
    required: {
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
      locationId: { kind: 'branded-integer', brand: LOCATION_ID },
    },
  },
  softDeletionEnabled: false,
});
