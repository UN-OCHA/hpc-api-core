import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { ENTITY_PROTOTYPE_ID } from './entityPrototype';
import { PLAN_ID } from './plan';

export type PlanEntityId = Brand<
  number,
  { readonly s: unique symbol },
  'planEntity.id'
>;

export const PLAN_ENTITY_ID = brandedType<number, PlanEntityId>(t.number);

export default defineLegacyVersionedModel({
  tableName: 'planEntity',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PLAN_ENTITY_ID },
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
  softDeletionEnabled: true,
});
