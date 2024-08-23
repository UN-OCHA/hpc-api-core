import * as t from 'io-ts';
import type { Knex } from 'knex';
import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

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
  project: null,
  governingEntity: null,
};

export default (masterConn: Knex, replicaConn?: Knex) => {
  const model = defineIDModel({
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
    softDeletionEnabled: false,
  })(masterConn, replicaConn);

  return {
    ...model,
    /**
     * @deprecated Use `deleteAuthTarget` utility method instead
     */
    destroy: model.destroy,
  };
};
