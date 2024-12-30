import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { LOCALIZED_PLURAL_STRING } from '../util/datatypes';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { CATEGORY_ID } from './category';
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

const PLAN_ENTITY_VERSION_REF = t.partial({
  planEntityIds: t.array(PLAN_ENTITY_ID),
  entityPrototypeId: ENTITY_PROTOTYPE_ID,
});

export const PLAN_ENTITY_VERSION_VALUE = t.type({
  categories: t.array(CATEGORY_ID),
  description: t.string,
  type: LOCALIZED_PLURAL_STRING,
  support: t.array(PLAN_ENTITY_VERSION_REF),
});
export type PlanEntityVersionValue = t.TypeOf<typeof PLAN_ENTITY_VERSION_VALUE>;

export default defineLegacyVersionedModel({
  tableName: 'planEntityVersion',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PLAN_ENTITY_VERSION_ID },
    },
    required: {
      planEntityId: { kind: 'branded-integer', brand: PLAN_ENTITY_ID },
      customReference: { kind: 'checked', type: t.string },
      value: { kind: 'checked', type: PLAN_ENTITY_VERSION_VALUE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
