import { defineSequelizeModel } from '../util/sequelize-model';
import { GOVERNING_ENTITY_ID } from './governingEntity';
import { SERVICE_MODALITY_ID } from './serviceModality';

export default defineSequelizeModel({
  tableName: 'serviceModalityAssociation',
  fields: {
    required: {
      serviceModalityId: {
        kind: 'branded-integer',
        brand: SERVICE_MODALITY_ID,
      },
      governingEntityId: {
        kind: 'branded-integer',
        brand: GOVERNING_ENTITY_ID,
      },
    },
  },
  softDeletionEnabled: false,
});
