import * as t from 'io-ts';
import { DATE } from '../util/datatypes';
import { defineSequelizeModel } from '../util/sequelize-model';
import { PARTICIPANT_ID } from './participant';

export default defineSequelizeModel({
  tableName: 'authToken',
  fields: {
    required: {
      participant: { kind: 'branded-integer', brand: PARTICIPANT_ID },
      tokenHash: { kind: 'checked', type: t.string },
    },
    optional: {
      expires: { kind: 'checked', type: DATE },
    },
  },
  softDeletionEnabled: false,
});
