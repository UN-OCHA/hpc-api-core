import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
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

const LOCALIZED_STRING = t.type({
  en: t.string,
});

const FIELDS = t.array(
  t.type({
    name: LOCALIZED_STRING,
    type: t.string,
  })
);

export const ATTACHMENT_PROTOTYPE_VALUE = t.intersection([
  // Required Fields
  t.type({
    hasMeasures: t.number,
    name: LOCALIZED_STRING,
    entities: t.array(t.string),
  }),
  // Optional Fields
  t.partial({
    measureFields: FIELDS,
    min: t.number,
    max: t.number,
    metrics: FIELDS,
  }),
]);

export default defineIDModel({
  tableName: 'attachmentPrototype',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: ATTACHMENT_PROTOTYPE_ID },
    },
    optional: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
    },
    accidentallyOptional: {
      refCode: { kind: 'checked', type: t.string },
      type: { kind: 'checked', type: ATTACHMENT_TYPE },
      value: { kind: 'checked', type: ATTACHMENT_PROTOTYPE_VALUE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
