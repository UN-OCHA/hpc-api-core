import * as t from 'io-ts';

import { Brand } from '../../util/types';
import { brandedType } from '../../util/io-ts';
import { defineSequelizeModel } from '../util/sequelize-model';

import { AUTH_TARGET_ID } from './authTarget';
import { AUTH_GRANTEE_ID } from './authGrantee';
import { PARTICIPANT_ID } from './participant';
import { DATE } from '../util/datatypes';

export type AuthGrantLogId = Brand<
  number,
  { readonly s: unique symbol },
  'authGranteeLog.id'
>;

export const AUTH_GRANT_LOG_ID = brandedType<number, AuthGrantLogId>(t.number);

export default defineSequelizeModel({
  tableName: 'authGrantLog',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: AUTH_GRANT_LOG_ID,
      },
    },
    required: {
      target: {
        kind: 'branded-integer',
        brand: AUTH_TARGET_ID,
      },
      grantee: {
        kind: 'branded-integer',
        brand: AUTH_GRANTEE_ID,
      },
      newRoles: {
        kind: 'checked',
        type: t.array(t.string),
      },
      actor: {
        kind: 'branded-integer',
        brand: PARTICIPANT_ID,
      },
      date: {
        kind: 'checked',
        type: DATE,
      },
    },
  },
  softDeletionEnabled: false,
});
