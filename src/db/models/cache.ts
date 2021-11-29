import * as t from 'io-ts';
import { defineSequelizeModel } from '../util/sequelize-model';

export default defineSequelizeModel({
  tableName: 'cache',
  fields: {
    required: {
      data: { kind: 'checked', type: t.unknown },
      fingerprint: { kind: 'checked', type: t.string },
      namespace: { kind: 'checked', type: t.string },
      tag: { kind: 'checked', type: t.string },
    },
  },
  softDeletionEnabled: false,
});
