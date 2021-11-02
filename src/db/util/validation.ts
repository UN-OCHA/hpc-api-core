/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use of `any` in this module is generally deliberate to help with generics
 */
import Knex = require('knex');
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isRight } from 'fp-ts/lib/Either';

import { nullable } from './datatypes';
import type {
  Field,
  FieldDefinition,
  FieldSet,
  InstanceDataOf,
} from './model-definition';
import { ModelInternals } from './raw-model';

/**
 * Given a model definition,
 * validate that it matches the database schema exactly,
 * and throw an error if not
 */
export const validateModelAgainstTable = async (
  modelInternals: ModelInternals<any>
): Promise<void> => {
  type KnexColumns = {
    [id: string]: Knex.ColumnInfo;
  };

  /**
   * Correct the type of the columns
   */
  const getDbCols = (await modelInternals
    .query()
    .columnInfo()) as any as KnexColumns;
  const dbCols = new Map(
    Object.entries(getDbCols).map(([name, col]) => [name, col])
  );

  // Get all column names from model, and check for duplicates
  const modelColumns = new Map<string, Field>();

  for (const group of Object.keys(
    modelInternals.fields
  ) as (keyof FieldDefinition)[]) {
    for (const [name, def] of Object.entries(
      modelInternals.fields[group] || {}
    )) {
      if (modelColumns.has(name)) {
        throw new Error(
          `Duplicate field (${name}) defined for ${modelInternals.tableName}`
        );
      }
      modelColumns.set(name, def);
    }
  }

  // Pair up model columns with
  const matchedColumns = new Map<
    string,
    {
      model: Field;
      db: Knex.ColumnInfo;
    }
  >();
  for (const [name, def] of modelColumns.entries()) {
    const dbCol = dbCols.get(name);
    if (dbCol) {
      matchedColumns.set(name, {
        model: def,
        db: dbCol,
      });
    }
  }

  // Check for missing or unmatched columns
  const missing = [...dbCols.keys()].filter((n) => !matchedColumns.has(n));
  const unmatched = [...modelColumns.keys()].filter(
    (n) => !matchedColumns.has(n)
  );

  if (missing.length > 0) {
    throw new Error(
      `Table ${
        modelInternals.tableName
      } is missing columns in definition: ${missing.join(', ')}`
    );
  }

  if (unmatched.length > 0) {
    throw new Error(
      `Table ${
        modelInternals.tableName
      } has unmatched columns in definition: ${unmatched.join(', ')}`
    );
  }

  // TODO: check types of all definitions
};

interface DataValidator<T> {
  /**
   * Check that the given data has the expected type,
   * and if not throw an error explaining why
   */
  validateAndFilter(data: unknown): T;
}

/**
 * Create a data-validator for a particular field definition
 *
 * (this is used by `raw-model` to check data coming from a database)
 */
export const dataValidator = <F extends FieldDefinition>(
  fields: F
): DataValidator<InstanceDataOf<F>> => {
  type Instance = InstanceDataOf<F>;

  const fieldSetValidator = <FS extends FieldSet>(
    set: FS,
    isNullable: boolean
  ): t.Type<any> => {
    const props: t.Props = {};
    for (const [key, def] of Object.entries(set)) {
      if (def.kind === 'branded-integer') {
        props[key] = t.number;
      } else if (def.kind === 'checked') {
        props[key] = def.type;
      } else if (def.kind === 'enum') {
        props[key] = t.keyof(def.values);
      }
    }
    if (isNullable) {
      return t.exact(nullable(props));
    } else {
      return t.exact(t.type(props));
    }
  };

  const instanceValidator = t.intersection([
    fieldSetValidator(fields.generated || {}, false),
    fieldSetValidator(fields.nonNullWithDefault || {}, false),
    fieldSetValidator(fields.required || {}, false),
    fieldSetValidator(fields.optional || {}, true),
    fieldSetValidator(fields.accidentallyOptional || {}, true),
  ]) as t.Type<unknown> as t.Type<Instance>;

  const validateAndFilter = (val: unknown): Instance => {
    const decoded = instanceValidator.decode(val);
    if (isRight(decoded)) {
      return decoded.right;
    } else {
      const errors = PathReporter.report(decoded);
      throw new Error(`Invalid data: ${errors.join(', ')}`);
    }
  };

  return {
    validateAndFilter,
  };
};

export const genericValidator = <T>(type: t.Type<T>, object: T) => {
  const decoded = type.decode(object);
  if (isRight(decoded)) {
    return decoded.right;
  } else {
    const errors = PathReporter.report(decoded);
    throw new Error(`Invalid data: ${errors.join(', ')}`);
  }
};
