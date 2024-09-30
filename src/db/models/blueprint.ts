import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { LOCALIZED_PLURAL_STRING, LOCALIZED_STRING } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import {
  ATTACHMENT_PROTOTYPE_VALUE,
  ATTACHMENT_TYPE,
} from './attachmentPrototype';

export type BlueprintId = Brand<
  number,
  { readonly s: unique symbol },
  'blueprint.id'
>;

export const BLUEPRINT_ID = brandedType<number, BlueprintId>(t.number);

export const BLUEPRINT_STATUS = t.keyof({
  disabled: null,
  active: null,
});

export const BLUEPRINT_TYPE = t.keyof({
  plan: null,
  operation: null,
});

export const ENTITY_REFS = t.array(
  t.type({
    refCode: t.string,
    cardinality: t.string,
  })
);

export const ENTITY_REFS_OR_XOR = t.union([
  ENTITY_REFS,
  t.type({
    xor: ENTITY_REFS,
  }),
]);

const BLUEPRINT_MODEL_ATTACHMENT_TYPE = t.union([
  ATTACHMENT_TYPE,
  t.keyof({
    cdmForm: null,
    planCaseLoad: null,
  }),
]);

/**
 * Recreating `ATTACHMENT_PROTOTYPE_VALUE` in order to make
 * `hasMeasures` an optional field
 */
const ATTACHMENT_PROTOTYPE_VALUE_LOOSE = t.intersection([
  t.type({
    name: ATTACHMENT_PROTOTYPE_VALUE.types[0].props.name,
    entities: ATTACHMENT_PROTOTYPE_VALUE.types[0].props.entities,
  }),
  t.partial({
    hasMeasures: ATTACHMENT_PROTOTYPE_VALUE.types[0].props.hasMeasures,
  }),
  ATTACHMENT_PROTOTYPE_VALUE.types[1],
]);

export const BLUEPRINT_MODEL = t.type({
  attachments: t.array(
    t.intersection([
      ATTACHMENT_PROTOTYPE_VALUE_LOOSE,
      t.type({
        type: BLUEPRINT_MODEL_ATTACHMENT_TYPE,
        refCode: t.string,
      }),
      t.partial({
        calculationMethod: t.array(t.string),
        indicatorDetail: t.array(t.string),
        hasReports: t.union([t.literal(0), t.literal(1)]),
      }),
    ])
  ),
  entities: t.array(
    t.intersection([
      // Required Fields
      t.type({
        type: t.string,
        refCode: t.string,
        name: LOCALIZED_PLURAL_STRING,
      }),
      // Optional Fields
      t.partial({
        possibleChildren: ENTITY_REFS,
        description: LOCALIZED_STRING,
        canSupport: ENTITY_REFS_OR_XOR,
      }),
    ])
  ),
});

export default defineIDModel({
  tableName: 'blueprint',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: BLUEPRINT_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      description: { kind: 'checked', type: t.string },
      status: { kind: 'checked', type: BLUEPRINT_STATUS },
      model: { kind: 'checked', type: BLUEPRINT_MODEL },
      type: { kind: 'checked', type: BLUEPRINT_TYPE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
