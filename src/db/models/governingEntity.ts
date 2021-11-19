import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { ENTITY_PROTOTYPE_ID } from './entityPrototype';
import { PLAN_ID } from './plan';

export type GoverningEntityId = Brand<
  number,
  { readonly s: unique symbol },
  'governingEntity.id'
>;

export const GOVERNING_ENTITY_ID = brandedType<number, GoverningEntityId>(
  t.number
);

export default defineLegacyVersionedModel({
  tableName: 'governingEntity',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: GOVERNING_ENTITY_ID,
      },
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
