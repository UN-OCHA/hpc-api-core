import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { ENTITY_PROTOTYPE_ID } from './entityPrototype';
import { PLAN_ID } from './plan';

export type ProcedureEntityPrototypeId = Brand<
  number,
  { readonly s: unique symbol },
  'procedureEntityPrototype.id'
>;

export const PROCEDURE_ENTITY_PROTOTYPE_ID = brandedType<
  number,
  ProcedureEntityPrototypeId
>(t.number);

export default defineIDModel({
  tableName: 'procedureEntityPrototype',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PROCEDURE_ENTITY_PROTOTYPE_ID },
    },
    required: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
      entityPrototypeId: {
        kind: 'branded-integer',
        brand: ENTITY_PROTOTYPE_ID,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
