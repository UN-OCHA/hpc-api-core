import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';
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
      value: { kind: 'checked', type: t.unknown },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
