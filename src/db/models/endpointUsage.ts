import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';

export const ENDPOINT_USAGE_METHOD = t.keyof({
  DELETE: null,
  GET: null,
  HEAD: null,
  OPTIONS: null,
  POST: null,
  PUT: null,
});

export default defineSequelizeModel({
  tableName: 'endpointUsage',
  fields: {
    required: {
      path: { kind: 'checked', type: t.string },
      method: { kind: 'checked', type: ENDPOINT_USAGE_METHOD },
    },
    nonNullWithDefault: {
      nb: { kind: 'checked', type: t.number },
    },
  },
  softDeletionEnabled: false,
});
