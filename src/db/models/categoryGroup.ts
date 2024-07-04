import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';

export const CATEGORY_GROUP_TYPE = t.keyof({
  beneficiaryGroup: null,
  contributionStatus: null,
  contributionType: null,
  customLocation: null,
  earmarkingType: null,
  emergencyType: null,
  flowStatus: null,
  flowType: null,
  genderMarker: null,
  inactiveReason: null,
  keywords: null,
  method: null,
  organizationLevel: null,
  organizationType: null,
  pendingStatus: null,
  planClusterType: null,
  planCosting: null,
  planIndicated: null,
  planLanguage: null,
  planType: null,
  projectGrouping1: null,
  projectGrouping2: null,
  projectPriority: null,
  regions: null,
  reportChannel: null,
  responseType: null,
  sectorIASC: null,
  subsetOfPlan: null,
});

export default defineSequelizeModel({
  tableName: 'categoryGroup',
  fields: {
    required: {
      type: { kind: 'checked', type: CATEGORY_GROUP_TYPE },
      name: { kind: 'checked', type: t.string },
    },
  },
  softDeletionEnabled: false,
});
