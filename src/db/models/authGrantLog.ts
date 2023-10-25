import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineSequelizeModel } from '../util/sequelize-model';

import { DATE } from '../util/datatypes';
import { AUTH_GRANTEE_ID } from './authGrantee';
import { AUTH_TARGET_ID } from './authTarget';
import { PARTICIPANT_ID } from './participant';

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
