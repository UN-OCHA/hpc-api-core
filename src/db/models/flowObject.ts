import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';
import { FLOW_ID } from './flow';
import { FLOW_OBJECT_TYPE_TYPE } from './flowObjectType';

export const FLOW_OBJECT_REF_DIRECTION = t.keyof({
  source: null,
  destination: null,
});

export type FlowObjectDirection = t.TypeOf<typeof FLOW_OBJECT_REF_DIRECTION>;

export const FLOW_OBJECT_BEHAVIOR = {
  overlap: null,
  shared: null,
};

export default defineSequelizeModel({
  tableName: 'flowObject',
  fields: {
    required: {
      flowID: { kind: 'branded-integer', brand: FLOW_ID },
      objectID: { kind: 'checked', type: t.number },
      objectType: { kind: 'checked', type: FLOW_OBJECT_TYPE_TYPE },
      refDirection: { kind: 'checked', type: FLOW_OBJECT_REF_DIRECTION },
    },
    nonNullWithDefault: {
      versionID: { kind: 'checked', type: t.number },
    },
    optional: {
      behavior: { kind: 'enum', values: FLOW_OBJECT_BEHAVIOR },
      objectDetail: { kind: 'checked', type: t.string },
    },
  },
  softDeletionEnabled: false,
});
