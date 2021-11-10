import { defineSequelizeModel } from '../util/sequelize-model';
import { GOVERNING_ENTITY_ID } from './governingEntity';
import { GOVERNING_ENTITY_VERSION_ID } from './governingEntityVersion';
import { PROJECT_VERSION_ID } from './project';

export default defineSequelizeModel({
  tableName: 'projectVersionGoverningEntity',
  fields: {
    required: {
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
      governingEntityId: {
        kind: 'branded-integer',
        brand: GOVERNING_ENTITY_ID,
      },
    },
    accidentallyOptional: {
      governingEntityVersionId: {
        kind: 'branded-integer',
        brand: GOVERNING_ENTITY_VERSION_ID,
      },
    },
  },
  softDeletionEnabled: false,
});
