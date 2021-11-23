import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';
import { LOCALIZED_PLURAL_STRING, LOCALIZED_STRING } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';

import { PLAN_ID } from './plan';

export type EntityPrototypeId = Brand<
  number,
  { readonly s: unique symbol },
  'entityPrototype.id'
>;

export const ENTITY_PROTOTYPE_ID = brandedType<number, EntityPrototypeId>(
  t.number
);

export const ENTITY_PROTOTYPE_REF_CODE = t.keyof({
  CA: null,
  CL: null,
  CO: null,
  CQ: null,
  CSO: null,
  IO: null,
  OC: null,
  OP: null,
  OUT: null,
  SO: null,
  SP: null,
  SSO: null,
});

export type EntityPrototypeRefCode = t.TypeOf<typeof ENTITY_PROTOTYPE_REF_CODE>;

export const ENTITY_PROTOTYPE_TYPE = t.keyof({
  GVE: null,
  PE: null,
});

const ENTITY_REFS = t.array(
  t.intersection([
    t.type({
      /**
       * Like in many other areas where IDs are stored in JSON in DB,
       * there is a mixup of values with strings
       *
       * TODO: Make sure no more string values are stored instead of numerical IDs
       */
      id: t.union([ENTITY_PROTOTYPE_ID, t.string]),
      refCode: t.string,
    }),
    t.partial({
      cardinality: t.union([t.literal('1-1'), t.literal('0-N')]),
      /**
       * @deprecated
       * There are records in database that have
       * this typo "cadinality", instead of "cardinality"
       *
       * TODO: Rename this property to "cardinality" in DB, then,
       * drop this definition and make "cardinality" required
       */
      cadinality: t.union([t.literal('1-1'), t.literal('0-N')]),
    }),
  ])
);

export const ENTITY_PROTOTYPE_VALUE = t.intersection([
  // Required Fields
  t.type({
    name: LOCALIZED_PLURAL_STRING,
  }),
  // Optional Fields
  t.partial({
    description: LOCALIZED_STRING,
    origId: t.number,
    possibleChildren: ENTITY_REFS,
    canSupport: t.union([
      ENTITY_REFS,
      t.type({
        xor: ENTITY_REFS,
      }),
    ]),
  }),
]);

export default defineIDModel({
  tableName: 'entityPrototype',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: ENTITY_PROTOTYPE_ID },
    },
    optional: { orderNumber: { kind: 'checked', type: t.number } },
    required: {
      refCode: { kind: 'checked', type: ENTITY_PROTOTYPE_REF_CODE },
      type: { kind: 'checked', type: ENTITY_PROTOTYPE_TYPE },
      planId: { kind: 'checked', type: PLAN_ID },
      value: { kind: 'checked', type: ENTITY_PROTOTYPE_VALUE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
