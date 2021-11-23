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
  /**
   * TODO: Some values in the database seem to have null values in this
   * array, which is problematic. We need to have stricter validation of
   * data being stored here, repair existing values, and then remove null
   * from this type
   */
  planEntityIds: t.array(t.union([t.null, PLAN_ENTITY_ID])),
  entityPrototypeId: ENTITY_PROTOTYPE_ID,
});

export const PLAN_ENTITY_VERSION_VALUE = t.intersection([
  t.type({
    categories: t.array(CATEGORY_ID),
    description: t.string,
    type: LOCALIZED_PLURAL_STRING,
  }),
  t.partial({
    support: t.union([
      t.array(
        t.union([
          /**
           * TODO: Some records in the database have `null` inside `support` array,
           * which is problematic. Stricter validation of data being stored should
           * be done, existing values removed and then `null` removed from this type.
           */
          t.null,
          PLAN_ENTITY_VERSION_REF,
        ])
      ),
      /**
       * TODO: Some records have object with key "0" instead of array of objects,
       * which is absolutely ridiculous. We need to have stricter validation of
       * data being stored here, convert existing cases to arrays, and then remove
       * this awful type edge case
       */
      t.partial({
        0: PLAN_ENTITY_VERSION_REF,
      }),
    ]),
  }),
]);
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
