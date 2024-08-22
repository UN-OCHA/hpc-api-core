/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use of `any` in this module is generally deliberate to help with generics
 */
import Knex = require('knex');
import { prepareCondition, type Condition } from './conditions';

import type {
  FieldDefinition,
  InstanceDataOf,
  UserDataOf,
} from './model-definition';
import { dataValidator } from './validation';

export type CreateFn<F extends FieldDefinition> = (
  data: UserDataOf<F>,
  opts?: {
    trx?: Knex.Transaction<any, any>;
  }
) => Promise<InstanceDataOf<F>>;

export type CreateManyFn<F extends FieldDefinition> = (
  data: Array<UserDataOf<F>>,
  opts?: {
    trx?: Knex.Transaction<any, any>;
  }
) => Promise<Array<InstanceDataOf<F>>>;

export type WhereCond<F extends FieldDefinition> = Condition<InstanceDataOf<F>>;

export type OrderByCond<F extends FieldDefinition> = {
  column: keyof InstanceDataOf<F>;
  order?: 'asc' | 'desc';
};

export type FindFn<F extends FieldDefinition, AdditionalArgs = {}> = (
  args?: {
    where?: WhereCond<F>;
    limit?: number;
    offset?: number;
    orderBy?: OrderByCond<F> | Array<OrderByCond<F>>;
    /**
     * WARNING: Only use this in very rare cases when performance gains
     * from disabling validation are worth the risk!
     */
    skipValidation?: boolean;
    trx?: Knex.Transaction<any, any>;
    /**
     * Uses `DISTINCT ON`, which is a feature unique to PostgreSQL.
     *
     * Keeps only the first row of each set of rows where the given (set of) column(s) is unique.
     * Note that the “first row” of each set is unpredictable unless `ORDER BY` is used to
     * ensure that the desired row appears first. If ordering is used, there is an important
     * constraint, because the first expression of `ORDER BY` must be present **somewhere** in
     * `DISTINCT ON` expressions. But, not all expressions of `ORDER BY` need to be in `DISTINCT ON`.
     */
    distinct?: Array<keyof InstanceDataOf<F>>;
  } & AdditionalArgs
) => Promise<Array<InstanceDataOf<F>>>;

export type FindOneFn<F extends FieldDefinition, AdditionalArgs = {}> = (
  args: {
    where: WhereCond<F>;
    trx?: Knex.Transaction<any, any>;
  } & AdditionalArgs
) => Promise<InstanceDataOf<F> | null>;

export type UpdateFn<F extends FieldDefinition> = (args: {
  values: Partial<UserDataOf<F>>;
  where: WhereCond<F>;
  /**
   * WARNING: Only use this in very rare cases when performance gains
   * from disabling validation are worth the risk!
   */
  skipValidation?: boolean;
  trx?: Knex.Transaction<any, any>;
}) => Promise<Array<InstanceDataOf<F>>>;

export type DestroyFn<F extends FieldDefinition> = (args: {
  where: WhereCond<F>;
  trx?: Knex.Transaction<any, any>;
}) => Promise<number>;

export type TruncateFn = (trx?: Knex.Transaction<any, any>) => Promise<void>;

export type CountFn<F extends FieldDefinition, AdditionalArgs = {}> = (
  args?: {
    where?: WhereCond<F>;
    trx?: Knex.Transaction<any, any>;
    /**
     * Will produce `SELECT COUNT(DISTINCT "columnName")` and if there
     * is an expression in `COUNT`, it will compute the number of input
     * rows in which the input value is **not null**. So, besides selecting
     * unique values of "columnName", it will also filter out `NULL` values
     */
    distinct?: Array<keyof InstanceDataOf<F>>;
  } & AdditionalArgs
) => Promise<bigint>;

export type ModelInternals<F extends FieldDefinition> = {
  readonly type: 'single-table';
  readonly tableName: string;
  readonly query: () => Knex.QueryBuilder<InstanceDataOf<F>>;
  readonly fields: FieldDefinition;
};

/**
 * The definition of a model
 */
export type Model<F extends FieldDefinition, AdditionalFindArgs = {}> = {
  readonly _internals: ModelInternals<F>;
  readonly create: CreateFn<F>;
  readonly createMany: CreateManyFn<F>;
  readonly find: FindFn<F, AdditionalFindArgs>;
  readonly findOne: FindOneFn<F, AdditionalFindArgs>;
  readonly update: UpdateFn<F>;
  readonly destroy: DestroyFn<F>;
  readonly truncate: TruncateFn;
  readonly count: CountFn<F, AdditionalFindArgs>;
};

export type InstanceDataOfModel<M extends Model<any>> = M extends Model<infer F>
  ? InstanceDataOf<F>
  : never;

/**
 * A function that takes a knex connection and returns the model definition
 */
export type ModelInitializer<
  F extends FieldDefinition,
  AdditionalFindArgs = {},
> = (masterConn: Knex, replicaConn?: Knex) => Model<F, AdditionalFindArgs>;

export const defineRawModel =
  <F extends FieldDefinition>(opts: {
    tableName: string;
    fields: F;
    /**
     * A function that takes raw data from an instance from the database,
     * and creates a string that can be used to identify it in error messages.
     */
    genIdentifier?: (data: unknown) => string;
  }): ModelInitializer<F> =>
  (masterConn, replicaConn): Model<F> => {
    const { tableName, fields, genIdentifier } = opts;

    const validateAndFilter = (row: unknown) =>
      validator.validateAndFilter(row, () =>
        genIdentifier ? genIdentifier(row) : `${tableName} row`
      );

    type Instance = InstanceDataOf<F>;

    const validator = dataValidator(fields);

    const masterTable = () => masterConn<Instance>(tableName);
    const replicaTable = replicaConn
      ? () => replicaConn<Instance>(tableName)
      : masterTable;

    const create: CreateFn<F> = async (data, options) => {
      const builder = options?.trx
        ? masterTable().transacting(options.trx)
        : masterTable();
      const res = await builder.insert([data]).returning('*');
      return validateAndFilter(res[0]);
    };

    const createMany: CreateManyFn<F> = async (data, options) => {
      if (!data.length) {
        return [];
      }

      const builder = options?.trx
        ? masterTable().transacting(options.trx)
        : masterTable();
      const res = await builder.insert(data).returning('*');
      return res.map(validateAndFilter);
    };

    const find: FindFn<F> = async ({
      where,
      limit,
      offset,
      orderBy,
      skipValidation = false,
      trx,
      distinct,
    } = {}) => {
      const builder = trx ? masterTable().transacting(trx) : replicaTable();
      const query = builder.where(prepareCondition(where ?? {})).select('*');

      if (limit !== undefined && limit > 0) {
        query.limit(limit);
      }

      if (offset !== undefined && offset > 0) {
        query.offset(offset);
      }

      if (orderBy !== undefined) {
        if (!Array.isArray(orderBy)) {
          orderBy = [orderBy];
        }
        query.orderBy(orderBy);
      }

      if (distinct && distinct.length >= 1) {
        if (
          (orderBy?.length ?? 0) >= 1 &&
          orderBy?.at(0)?.column !== distinct.at(0)
        ) {
          throw new Error(
            'SELECT DISTINCT ON expressions must match initial ORDER BY expression'
          );
        }
        query.distinctOn(distinct);
      }

      const res = await query;

      if (skipValidation) {
        return res as Instance[];
      }

      return res.map(validateAndFilter);
    };

    const findOne: FindOneFn<F> = async (opts) => {
      const res = await find(opts);
      if (res.length > 1) {
        throw new Error('More than 1 result returned');
      } else if (res.length === 1) {
        return res[0];
      } else {
        return null;
      }
    };

    const update: UpdateFn<F> = async ({
      values,
      where,
      skipValidation = false,
      trx,
    }) => {
      const builder = trx ? masterTable().transacting(trx) : masterTable();
      const res = await builder
        .where(prepareCondition(where || {}))
        .update(values as any)
        .returning('*');

      if (skipValidation) {
        return res as Instance[];
      }

      return (res as unknown[]).map(validateAndFilter);
    };

    const destroy: DestroyFn<F> = async ({ where, trx }) => {
      const builder = trx ? masterTable().transacting(trx) : masterTable();
      const count = await builder.where(prepareCondition(where || {})).delete();
      return count;
    };

    const truncate: TruncateFn = async (trx) => {
      const builder = trx ? masterTable().transacting(trx) : masterTable();
      await builder.truncate();
    };

    const count: CountFn<F> = async ({ where, trx, distinct } = {}) => {
      const builder = trx ? masterTable().transacting(trx) : replicaTable();
      const query = builder.where(prepareCondition(where ?? {}));

      if (distinct !== undefined) {
        query.countDistinct(distinct);
      } else {
        query.count('*');
      }

      const res = (await query) as unknown as [{ count: string }];

      if (res.length !== 1) {
        throw new Error('Count result must be an array of single element');
      }

      return BigInt(res[0].count);
    };

    return {
      _internals: {
        type: 'single-table',
        tableName,
        query: masterTable,
        fields,
      },
      create,
      createMany,
      find,
      findOne,
      update,
      destroy,
      truncate,
      count,
    };
  };
