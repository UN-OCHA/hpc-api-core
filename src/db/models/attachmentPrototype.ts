import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { LOCALIZED_STRING } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { PLAN_ID } from './plan';

export type AttachmentPrototypeId = Brand<
  number,
  { readonly s: unique symbol },
  'attachmentPrototype.id'
>;

export const ATTACHMENT_PROTOTYPE_ID = brandedType<
  number,
  AttachmentPrototypeId
>(t.number);

export const ATTACHMENT_TYPE = t.keyof({
  caseLoad: null,
  contact: null,
  cost: null,
  fileWebContent: null,
  indicator: null,
  textWebContent: null,
});
export type AttachmentType = t.TypeOf<typeof ATTACHMENT_TYPE>;

const FIELDS = t.array(
  t.type({
    name: LOCALIZED_STRING,
    type: t.string,
  })
);

export const ATTACHMENT_PROTOTYPE_VALUE = t.intersection([
  // Required Fields
  t.type({
    /**
     * Some prototypes incorrectly quote numbers, which we need to account for
     *
     * TODO: clean prototype data and make type stricter
     */
    hasMeasures: t.union([
      t.literal(0),
      t.literal(1),
      t.literal('0'),
      t.literal('1'),
    ]),
    name: LOCALIZED_STRING,
    entities: t.array(t.string),
  }),
  // Optional Fields
  t.partial({
    measureFields: FIELDS,
    /**
     * Some prototypes incorrectly quote numbers, which we need to account for
     *
     * TODO: clean prototype data and make type stricter
     */
    min: t.union([t.number, t.string]),
    /**
     * Some prototypes incorrectly quote numbers, which we need to account for
     *
     * TODO: clean prototype data and make type stricter
     */
    max: t.union([t.number, t.string]),
    metrics: FIELDS,
  }),
]);

export default defineIDModel({
  tableName: 'attachmentPrototype',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: ATTACHMENT_PROTOTYPE_ID },
    },
    required: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
      refCode: { kind: 'checked', type: t.string },
      type: { kind: 'checked', type: ATTACHMENT_TYPE },
      value: { kind: 'checked', type: ATTACHMENT_PROTOTYPE_VALUE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
