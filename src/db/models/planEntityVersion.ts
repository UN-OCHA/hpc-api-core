import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { LOCALIZED_PLURAL_STRING } from '../util/datatypes';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { ENTITY_PROTOTYPE_ID } from './entityPrototype';
import { PLAN_ENTITY_ID } from './planEntity';

export type PlanEntityVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'planEntityVersion.id'
>;

export const PLAN_ENTITY_VERSION_ID = brandedType<number, PlanEntityVersionId>(
  t.number
);

export const PLAN_ENTITY_VERSION_VALUE = t.type({
  categories: t.array(t.unknown),
  description: t.string,
  support: t.array(
    t.intersection([
      t.type({
        planEntityIds: t.array(PLAN_ENTITY_ID),
      }),
      t.partial({
        entityPrototypeId: ENTITY_PROTOTYPE_ID,
      }),
    ])
  ),
  type: LOCALIZED_PLURAL_STRING,
});
export type PlanEntityVersionValue = t.TypeOf<typeof PLAN_ENTITY_VERSION_VALUE>;

export default defineLegacyVersionedModel({
  tableName: 'planEntityVersion',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PLAN_ENTITY_VERSION_ID },
    },
    accidentallyOptional: {
      planEntityId: { kind: 'branded-integer', brand: PLAN_ENTITY_ID },
      customReference: { kind: 'checked', type: t.string },
      value: { kind: 'checked', type: PLAN_ENTITY_VERSION_VALUE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
