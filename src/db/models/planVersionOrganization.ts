import { defineSequelizeModel } from '../util/sequelize-model';
import { ORGANIZATION_ID } from './organization';
import { PLAN_VERSION_ID } from './planVersion';

export default defineSequelizeModel({
  tableName: 'planVersionOrganization',
  fields: {
    required: {
      organizationId: { kind: 'branded-integer', brand: ORGANIZATION_ID },
      planVersionId: { kind: 'branded-integer', brand: PLAN_VERSION_ID },
    },
  },
  softDeletionEnabled: false,
});
