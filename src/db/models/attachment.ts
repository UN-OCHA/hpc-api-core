import * as t from 'io-ts';
import { brandedType } from '../../util/io-ts';

import type { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import {
  ATTACHMENT_PROTOTYPE_ID,
  ATTACHMENT_TYPE,
} from './attachmentPrototype';
import { PLAN_ID } from './plan';

export type AttachmentId = Brand<
  number,
  { readonly s: unique symbol },
  'attachment.id'
>;

export const ATTACHMENT_ID = brandedType<number, AttachmentId>(t.number);

export const COST_ATTACHMENT_VALUE = t.type({
  cost: t.number,
});

export const ATTACHMENT_OBJECT_TYPE = t.keyof({
  governingEntity: null,
  plan: null,
  planEntity: null,
});

export default defineLegacyVersionedModel({
  tableName: 'attachment',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: ATTACHMENT_ID,
      },
    },
    accidentallyOptional: {
      attachmentPrototypeId: {
        kind: 'branded-integer',
        brand: ATTACHMENT_PROTOTYPE_ID,
      },
      planId: {
        kind: 'branded-integer',
        brand: PLAN_ID,
      },
    },
    required: {
      objectId: {
        kind: 'checked',
        type: t.number,
      },
      objectType: {
        kind: 'checked',
        type: ATTACHMENT_OBJECT_TYPE,
      },
      type: {
        kind: 'checked',
        type: ATTACHMENT_TYPE,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
