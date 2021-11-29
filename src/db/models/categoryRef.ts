import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';
import { CATEGORY_ID } from './category';

export const CATEGORY_REF_OBJECT_TYPE = t.keyof({
  emergency: null,
  flow: null,
  location: null,
  organization: null,
  plan: null,
  projectVersion: null,
  reportDetail: null,
});

export default defineSequelizeModel({
  tableName: 'categoryRef',
  fields: {
    required: {
      objectID: { kind: 'checked', type: t.number },
      objectType: { kind: 'checked', type: CATEGORY_REF_OBJECT_TYPE },
      categoryID: { kind: 'branded-integer', brand: CATEGORY_ID },
    },
    nonNullWithDefault: {
      versionID: { kind: 'checked', type: t.number },
    },
  },
  softDeletionEnabled: false,
});
