import { defineSequelizeModel } from '../util/sequelize-model';
import { PLAN_ENTITY_ID } from './planEntity';
import { PLAN_ENTITY_VERSION_ID } from './planEntityVersion';
import { PROJECT_VERSION_ID } from './project';

export default defineSequelizeModel({
  tableName: 'projectVersionPlanEntity',
  fields: {
    required: {
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
      planEntityId: { kind: 'branded-integer', brand: PLAN_ENTITY_ID },
      planEntityVersionId: {
        kind: 'branded-integer',
        brand: PLAN_ENTITY_VERSION_ID,
      },
    },
  },
  softDeletionEnabled: false,
});
