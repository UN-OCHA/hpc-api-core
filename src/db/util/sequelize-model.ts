/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Use of `any` in this module is generally deliberate to help with generics
 */
import merge = require('lodash/merge');

import { DATE } from './datatypes';
import {
  defineRawModel,
  ModelInitializer,
  CreateFn,
  UpdateFn,
} from './raw-model';
import { FieldDefinition } from './model-definition';

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
  SoftDeletionEnabled extends boolean
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
    softDeletionEnabled: SoftDeletionEnabled;
  }): ModelInitializer<FieldsWithSequelize<F, SoftDeletionEnabled>> =>
  (conn) => {
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
    })(conn);

    const create: CreateFn<Fields> = async (data, opts) => {
      return model.create(
        {
          ...data,
          createdAt: conn.fn.now(),
          updatedAt: conn.fn.now(),
        },
        opts
      );
    };

    const update: UpdateFn<Fields> = async (args) => {
      return model.update({
        ...args,
        values: {
          ...args.values,
          updatedAt: conn.fn.now(),
        },
      });
    };

    return {
      ...model,
      create,
      update,
    };
  };
