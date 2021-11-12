import * as t from 'io-ts';

import { brandedType, EMPTY_TUPLE } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { CONDITION_FIELD_TYPE_TYPE } from './conditionFieldType';
import { PLAN_ID } from './plan';

export type ConditionFieldId = Brand<
  number,
  { readonly s: unique symbol },
  'conditionField.id'
>;

export const CONDITION_FIELD_ID = brandedType<number, ConditionFieldId>(
  t.number
);

export const CONDITION_FIELD_RULES = t.union([
  t.partial({
    conditionality: t.type({ value: t.string }),
    max: t.number,
    maxlength: t.number,
    min: t.number,
    /**
     * @deprecated
     * There is a record in database that has
     * this typo "mulitple", instead of "multiple"
     *
     * TODO: Rename this property to "multiple" in DB, then drop this definition
     */
    mulitple: t.boolean,
    multiple: t.boolean,
    options: t.array(t.string),
  }),
  EMPTY_TUPLE,
]);

export const CONDITION_FIELD_LABEL = t.union([
  t.partial({
    en: t.type({ value: t.string }),
  }),
  EMPTY_TUPLE,
]);

export default defineIDModel({
  tableName: 'conditionField',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: CONDITION_FIELD_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      fieldType: { kind: 'checked', type: CONDITION_FIELD_TYPE_TYPE },
      required: { kind: 'checked', type: t.boolean },
      planId: { kind: 'branded-integer', brand: PLAN_ID },
    },
    optional: {
      rules: { kind: 'checked', type: CONDITION_FIELD_RULES },
      order: { kind: 'checked', type: t.number },
      description: { kind: 'checked', type: t.string },
    },
    nonNullWithDefault: {
      grouping: { kind: 'checked', type: t.boolean },
      label: { kind: 'checked', type: CONDITION_FIELD_LABEL },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
