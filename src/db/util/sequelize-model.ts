/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Use of `any` in this module is generally deliberate to help with generics
 */
import merge = require('lodash/merge');

import { Cond, Op } from './conditions';
import { DATE } from './datatypes';
import { type FieldDefinition } from './model-definition';
import {
  defineRawModel,
  type CreateFn,
  type CreateManyFn,
  type FindFn,
  type FindOneFn,
  type ModelInitializer,
  type UpdateFn,
} from './raw-model';

type DeletedAtField<SoftDeletionEnabled extends boolean> =
  SoftDeletionEnabled extends true
    ? {
        optional: {
          deletedAt: {
            kind: 'checked';
            type: typeof DATE;
          };
        };
      }
    : {};

const SEQUELIZE_FIELDS = {
  nonNullWithDefault: {
    createdAt: {
      kind: 'checked',
      type: DATE,
    },
    updatedAt: {
      kind: 'checked',
      type: DATE,
    },
  },
} as const;

type SequelizeFields = typeof SEQUELIZE_FIELDS;

export type FieldsWithSequelize<
  F extends FieldDefinition,
  SoftDeletionEnabled extends boolean,
> = F & SequelizeFields & DeletedAtField<SoftDeletionEnabled>;

const genDeletedAtField = <P extends boolean>(
  softDeletionEnabled: P
): DeletedAtField<P> =>
  (softDeletionEnabled
    ? {
        optional: {
          deletedAt: {
            kind: 'checked',
            type: DATE,
          },
        },
      }
    : {}) as DeletedAtField<P>;

export type AdditionalFindArgsForSequelizeTables = {
  /**
   * If true, also include deleted records in the result.
   *
   * This only affects tables with softDeletionEnabled set to true
   */
  includeDeleted?: true;
};

/**
 * A model that has been defined by sequelize
 *
 * This definition function extends the given table definition with columns that
 * are present on all models defined by sequelize.
 *
 * It also ensures that `createdAt` and `updatedAt` fields are updated as needed
 */
export const defineSequelizeModel =
  <F extends FieldDefinition, SoftDeletionEnabled extends boolean>(opts: {
    tableName: string;
    fields: F;
    /**
     * A function that takes raw data from an instance from the database,
     * and creates a string that can be used to identify it in error messages.
     */
    genIdentifier?: (data: unknown) => string;
    softDeletionEnabled: SoftDeletionEnabled;
  }): ModelInitializer<
    FieldsWithSequelize<F, SoftDeletionEnabled>,
    AdditionalFindArgsForSequelizeTables
  > =>
  (masterConn, replicaConn) => {
    type Fields = FieldsWithSequelize<F, SoftDeletionEnabled>;

    const fields: Fields = merge(
      {},
      opts.fields,
      SEQUELIZE_FIELDS,
      genDeletedAtField(opts.softDeletionEnabled)
    );
    const model = defineRawModel({
      ...opts,
      fields,
    })(masterConn, replicaConn);

    const find: FindFn<Fields, AdditionalFindArgsForSequelizeTables> = (
      args
    ) => {
      if (args?.includeDeleted || !opts.softDeletionEnabled) {
        return model.find(args);
      }
      return model.find({
        ...args,
        where: {
          [Cond.AND]: [
            {
              deletedAt: {
                [Op.IS_NULL]: true,
              },
            },
            args?.where ?? {},
          ],
        },
      });
    };

    const findOne: FindOneFn<Fields, AdditionalFindArgsForSequelizeTables> = (
      args
    ) => {
      if (args?.includeDeleted || !opts.softDeletionEnabled) {
        return model.findOne(args);
      }
      return model.findOne({
        ...args,
        where: {
          [Cond.AND]: [
            {
              deletedAt: {
                [Op.IS_NULL]: true,
              },
            },
            args?.where || {},
          ],
        },
      });
    };

    const create: CreateFn<Fields> = (data, opts) => {
      return model.create(
        {
          ...data,
          createdAt: masterConn.fn.now(3),
          updatedAt: masterConn.fn.now(3),
        },
        opts
      );
    };

    const createMany: CreateManyFn<Fields> = (data, opts) => {
      return model.createMany(
        data.map((data) => ({
          ...data,
          createdAt: masterConn.fn.now(3),
          updatedAt: masterConn.fn.now(3),
        })),
        opts
      );
    };

    const update: UpdateFn<Fields> = (args) => {
      return model.update({
        ...args,
        values: {
          ...args.values,
          updatedAt: masterConn.fn.now(3),
        },
      });
    };

    return {
      ...model,
      find,
      findOne,
      create,
      createMany,
      update,
    };
  };
