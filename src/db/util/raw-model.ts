/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use of `any` in this module is generally deliberate to help with generics
 */
import Knex = require('knex');

import {
  FieldDefinition,
  UserDataOf,
  InstanceDataOf,
} from './model-definition';
import { dataValidator } from './validation';

export type CreateFn<F extends FieldDefinition> = (
  data: UserDataOf<F>,
  opts?: {
    trx?: Knex.Transaction<any, any>;
  }
) => Promise<InstanceDataOf<F>>;

export type WhereCond<F extends FieldDefinition> =
  | Knex.QueryCallback<InstanceDataOf<F>, InstanceDataOf<F>>
  | Partial<InstanceDataOf<F>>;

export type FindFn<F extends FieldDefinition> = (args?: {
  where?: WhereCond<F>;
  trx?: Knex.Transaction<any, any>;
}) => Promise<Array<InstanceDataOf<F>>>;

export type FindOneFn<F extends FieldDefinition> = (args: {
  where: WhereCond<F>;
  trx?: Knex.Transaction<any, any>;
}) => Promise<InstanceDataOf<F> | null>;

export type UpdateFn<F extends FieldDefinition> = (args: {
  values: Partial<UserDataOf<F>>;
  where: WhereCond<F>;
  trx?: Knex.Transaction<any, any>;
}) => Promise<Array<InstanceDataOf<F>>>;

export type DestroyFn<F extends FieldDefinition> = (args: {
  where: WhereCond<F>;
  trx?: Knex.Transaction<any, any>;
}) => Promise<number>;

export type ModelInternals<F extends FieldDefinition> = {
  readonly type: 'single-table';
  readonly tableName: string;
  readonly query: () => Knex.QueryBuilder<InstanceDataOf<F>>;
  readonly fields: FieldDefinition;
};

/**
 * The definition of a model
 */
export type Model<F extends FieldDefinition> = {
  readonly _internals: ModelInternals<F>;
  readonly create: CreateFn<F>;
  readonly find: FindFn<F>;
  readonly findOne: FindOneFn<F>;
  readonly update: UpdateFn<F>;
  readonly destroy: DestroyFn<F>;
};

export type InstanceDataOfModel<M extends Model<any>> = M extends Model<infer F>
  ? InstanceDataOf<F>
  : never;

/**
 * A function that takes a knex connection and returns the model definition
 */
export type ModelInitializer<F extends FieldDefinition> = (
  conn: Knex
) => Model<F>;

export const defineRawModel =
  <F extends FieldDefinition>(opts: {
    tableName: string;
    fields: F;
  }): ModelInitializer<F> =>
  (conn): Model<F> => {
    const { tableName, fields } = opts;

    type Instance = InstanceDataOf<F>;

    const validator = dataValidator(fields);

    const tbl = () => conn<Instance>(tableName);

    const create: CreateFn<F> = async (data, opts) => {
      const builder = opts?.trx ? tbl().transacting(opts.trx) : tbl();
      const res = await builder.insert([data as any]).returning('*');
      return validator.validateAndFilter(res[0]);
    };

    const find: FindFn<F> = async ({ where, trx } = {}) => {
      const builder = trx ? tbl().transacting(trx) : tbl();
      const res = await builder.where(where || {}).select('*');
      return res.map(validator.validateAndFilter);
    };

    const findOne: FindOneFn<F> = async (opts) => {
      const res = await find(opts);
      if (res.length > 1) {
        throw new Error(`More than 1 result returned`);
      } else if (res.length === 1) {
        return res[0];
      } else {
        return null;
      }
    };

    const update: UpdateFn<F> = async ({ values, where, trx }) => {
      const builder = trx ? tbl().transacting(trx) : tbl();
      const res = await builder
        .where(where)
        .update(values as any)
        .returning('*');
      return (res as unknown[]).map(validator.validateAndFilter);
    };

    const destroy: DestroyFn<F> = async ({ where, trx }) => {
      const builder = trx ? tbl().transacting(trx) : tbl();
      const count = await builder.where(where).delete();
      return count;
    };

    return {
      _internals: {
        type: 'single-table',
        tableName,
        query: tbl,
        fields,
      },
      create,
      find,
      findOne,
      update,
      destroy,
    };
  };
