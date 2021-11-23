import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { CONDITION_FIELD_ID } from './conditionField';
import { PROJECT_VERSION_PLAN_ID } from './projectVersionPlan';

export type ProjectVersionFieldId = Brand<
  number,
  { readonly s: unique symbol },
  'projectVersionField.id'
>;

export const PROJECT_VERSION_FIELD_ID = brandedType<
  number,
  ProjectVersionFieldId
>(t.number);

export default defineIDModel({
  tableName: 'projectVersionField',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PROJECT_VERSION_FIELD_ID },
    },
    required: {
      conditionFieldId: { kind: 'branded-integer', brand: CONDITION_FIELD_ID },
      projectVersionPlanId: {
        kind: 'branded-integer',
        brand: PROJECT_VERSION_PLAN_ID,
      },
    },
    optional: {
      value: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
