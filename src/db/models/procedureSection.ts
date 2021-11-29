import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PLAN_ID } from './plan';

export type ProcedureSectionId = Brand<
  number,
  { readonly s: unique symbol },
  'procedureSection.id'
>;

export const PROCEDURE_SECTION_ID = brandedType<number, ProcedureSectionId>(
  t.number
);

export default defineIDModel({
  tableName: 'procedureSection',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PROCEDURE_SECTION_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      planId: { kind: 'branded-integer', brand: PLAN_ID },
    },
    optional: {
      order: { kind: 'checked', type: t.number },
      /**
       * This column is defined with json data type, but at the time
       * of this model definition, all non-null records are strings
       *
       * It is left to developer to make necessary type checks.
       * Don't use type assertion (`as string`) with this column.
       */
      description: { kind: 'checked', type: t.unknown },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
