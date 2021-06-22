import * as t from 'io-ts';
import { defineIDModel } from '../util/id-model';

import { Brand } from '../../util/types';
import { brandedType } from '../../util/io-ts';

export type AuthTargetId = Brand<
  number,
  { readonly s: unique symbol },
  'authTarget.id'
>;

export const AUTH_TARGET_ID = brandedType<number, AuthTargetId>(t.number);

const AUTH_TARGET_TYPE = {
  global: null,
  operation: null,
  operationCluster: null,
  plan: null,
  governingEntity: null,
};

export default defineIDModel({
  tableName: 'authTarget',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: AUTH_TARGET_ID,
      },
    },
    optional: {
      targetId: {
        kind: 'checked',
        type: t.number,
      },
    },
    required: {
      type: {
        kind: 'enum',
        values: AUTH_TARGET_TYPE,
      },
    },
  },
  idField: 'id',
  paranoid: false,
});
