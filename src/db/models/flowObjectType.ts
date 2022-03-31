import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';

export const FLOW_OBJECT_TYPE_TYPE = t.keyof({
  anonymizedOrganization: null,
  cluster: null,
  corePlanEntityActivity: null,
  corePlanEntityObjective: null,
  emergency: null,
  flow: null,
  globalCluster: null,
  governingEntity: null,
  location: null,
  organization: null,
  plan: null,
  planEntity: null,
  project: null,
  usageYear: null,
});

export default defineSequelizeModel({
  tableName: 'flowObjectType',
  fields: {
    required: {
      /**
       * Don't restrict to FLOW_OBJECT_TYPE_TYPE,
       * because we want new types to be defined,
       * but usage of this column should be validated
       */
      type: { kind: 'checked', type: t.string },
      name: { kind: 'checked', type: t.string },
    },
  },
  softDeletionEnabled: false,
});
