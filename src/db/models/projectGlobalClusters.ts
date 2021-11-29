import { defineSequelizeModel } from '../util/sequelize-model';
import { GLOBAL_CLUSTER_ID } from './globalCluster';
import { PROJECT_VERSION_ID } from './project';

export default defineSequelizeModel({
  tableName: 'projectGlobalClusters',
  fields: {
    required: {
      globalClusterId: { kind: 'branded-integer', brand: GLOBAL_CLUSTER_ID },
      projectVersionId: { kind: 'branded-integer', brand: PROJECT_VERSION_ID },
    },
  },
  softDeletionEnabled: false,
});
