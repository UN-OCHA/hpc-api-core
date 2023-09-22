/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use of `any` in this module is generally deliberate to help with generics
 */
import * as t from 'io-ts';

import { Brand } from '../../util/types';
import { Nullable } from './datatypes';

// Fields

type BrandedFieldTypeOf<Brand extends BrandedField['brand']> =
  Brand extends t.Type<infer B> ? B : never;

type BrandedField = {
  kind: 'branded-integer';
  brand: t.Type<Brand<any, any, any>>;
};

type EnumField = {
  kind: 'enum';
  values: {
    [id: string]: null;
  };
};

type CheckedField = {
  kind: 'checked';
  type: t.Type<any>;
};

export type Field = BrandedField | EnumField | CheckedField;

export type FieldTypeOf<F extends Field> = F extends EnumField
  ? keyof F['values']
  : F extends CheckedField
  ? t.TypeOf<F['type']>
  : F extends BrandedField
  ? BrandedFieldTypeOf<F['brand']>
  : never;

// Field Sets

export type FieldSet = {
  [id: string]: Field;
};

export type FieldDefinition = {
  /**
   * Properties that are determined automatically by the database,
   * and should not have user-specified values,
   * such ids that use autoIncrement.
   */
  generated?: FieldSet;
  /**
   * Same as `generated`, but indicates that auto-incremented ID is used as
   * part of a composite primary key on the table, thus we need to make it
   * possible for client code to specify these IDs when inserting new rows.
   */
  generatedCompositeKey?: FieldSet;
  nonNullWithDefault?: FieldSet;
  optional?: FieldSet;
  accidentallyOptional?: FieldSet;
  required?: FieldSet;
};

export type FieldValuesOfSet<Set extends FieldSet | undefined> =
  Set extends FieldSet
    ? {
        [K in keyof Set]: FieldTypeOf<Set[K]>;
      }
    : {};

export type InstanceDataOf<F extends FieldDefinition> = FieldValuesOfSet<
  F['generated']
> &
  FieldValuesOfSet<F['generatedCompositeKey']> &
  FieldValuesOfSet<F['nonNullWithDefault']> &
  FieldValuesOfSet<F['required']> &
  Nullable<FieldValuesOfSet<F['optional']>> &
  Nullable<FieldValuesOfSet<F['accidentallyOptional']>>;

export type UserDataOf<F extends FieldDefinition> = Partial<
  FieldValuesOfSet<F['generatedCompositeKey']>
> &
  Partial<FieldValuesOfSet<F['nonNullWithDefault']>> &
  FieldValuesOfSet<F['required']> &
  FieldValuesOfSet<F['accidentallyOptional']> &
  Partial<Nullable<FieldValuesOfSet<F['optional']>>>;
