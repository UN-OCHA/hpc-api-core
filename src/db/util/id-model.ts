import Knex = require('knex');

import { Model } from './raw-model';
import {
  Field,
  FieldTypeOf,
  FieldDefinition,
  InstanceDataOf,
} from './model-definition';
import { defineSequelizeModel, FieldsWithSequelize } from './sequelize-model';

/**
 * Given a definition of fields, and the name of an ID prop,
 * calculate the type for ID values
 */
type IdOf<
  F extends FieldDefinition,
  IDField extends null | keyof F['generated']
> = IDField extends string
  ? F['generated'] extends {
      [K in IDField]: Field;
    }
    ? FieldTypeOf<F['generated'][IDField]>
    : never
  : never;

/**
 * Extend the raw definition of a model with functions that are only available
 * on models with an ID field
 */
export interface ModelWithId<
  F extends FieldDefinition,
  IDField extends null | keyof F['generated']
> extends Model<F> {
  readonly get: (id: IdOf<F, IDField>) => Promise<null | InstanceDataOf<F>>;
}

/**
 * A function that takes a knex connection and returns the model definition
 */
export type ModelWithIdInitializer<
  F extends FieldDefinition,
  IDField extends null | keyof F['generated']
> = (conn: Knex) => ModelWithId<F, IDField>;

export type { FieldsWithSequelize as FieldsWithId };

/**
 * Model that extends the base sequelize model with functionality for models
 * with an ID field
 *
 * In particular, get & create methods
 */
export const defineIDModel =
  <
    F extends FieldDefinition,
    IDField extends keyof F['generated'],
    SoftDeletionEnabled extends boolean
  >(opts: {
    tableName: string;
    fields: F;
    idField: IDField;
    softDeletionEnabled: SoftDeletionEnabled;
  }): ModelWithIdInitializer<
    FieldsWithSequelize<F, SoftDeletionEnabled>,
    IDField
  > =>
  (conn) => {
    const { idField } = opts;
    type Fields = FieldsWithSequelize<F, SoftDeletionEnabled>;
    type ID = IdOf<Fields, IDField>;
    type Instance = InstanceDataOf<Fields>;

    const model = defineSequelizeModel(opts)(conn);

    const get = async (id: ID): Promise<Instance | null> =>
      model.findOne({
        where: {
          [idField]: id,
        } as Partial<Instance>,
      });

    // Extend the model with a get
    const extendedModel = {
      ...model,
      get,
    };
    return extendedModel;
  };
