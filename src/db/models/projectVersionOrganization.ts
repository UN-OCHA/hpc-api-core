import { defineSequelizeModel } from '../util/sequelize-model';
import { ORGANIZATION_ID } from './organization';
import { PROJECT_VERSION_ID } from './project';

export default defineSequelizeModel({
  tableName: 'projectVersionOrganization',
  fields: {
    required: {
      organizationId: { kind: 'branded-integer', brand: ORGANIZATION_ID },
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
    },
  },
  softDeletionEnabled: false,
});
