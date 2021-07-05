import * as t from 'io-ts';
import { defineIDModel } from '../util/id-model';

import type { Brand } from '../../util/types';
import { brandedType } from '../../util/io-ts';

export type AuthGranteeId = Brand<
  number,
  { readonly s: unique symbol },
  'authGrantee.id'
>;

export const AUTH_GRANTEE_ID = brandedType<number, AuthGranteeId>(t.number);

/**
 * TODO: expand this with group and bot functionality
 */
const AUTH_GRANTEE_TYPE = {
  user: null,
};

export default defineIDModel({
  tableName: 'authGrantee',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: AUTH_GRANTEE_ID,
      },
    },
    required: {
      type: {
        kind: 'enum',
        values: AUTH_GRANTEE_TYPE,
      },
      granteeId: {
        kind: 'checked',
        type: t.number,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
