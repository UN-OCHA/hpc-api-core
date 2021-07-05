import * as t from 'io-ts';

import { AUTH_TARGET_ID } from './authTarget';
import { PARTICIPANT_ID } from './participant';
import { defineSequelizeModel } from '../util/sequelize-model';

export default defineSequelizeModel({
  tableName: 'authInvite',
  fields: {
    required: {
      target: {
        kind: 'branded-integer',
        brand: AUTH_TARGET_ID,
      },
      email: {
        kind: 'checked',
        type: t.string,
      },
      roles: {
        kind: 'checked',
        type: t.array(t.string),
      },
      actor: {
        kind: 'branded-integer',
        brand: PARTICIPANT_ID,
      },
    },
  },
  softDeletionEnabled: false,
});
