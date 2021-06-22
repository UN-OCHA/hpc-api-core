import * as t from 'io-ts';

import type { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { ATTACHMENT_ID } from './attachment';
import { brandedType } from '../../util/io-ts';

export type AttachmentVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'attachmentVersion.id'
>;

export const ATTACHMENT_VERSION_ID = brandedType<number, AttachmentVersionId>(
  t.number
);

export const COST_ATTACHMENT_VALUE = t.type({
  cost: t.number,
});

export default defineLegacyVersionedModel({
  tableName: 'attachmentVersion',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: ATTACHMENT_VERSION_ID,
      },
    },
    nonNullWithDefault: {
      hasDisaggregatedData: {
        kind: 'checked',
        type: t.boolean,
      },
    },
    accidentallyOptional: {
      attachmentId: {
        kind: 'branded-integer',
        brand: ATTACHMENT_ID,
      },
      customReference: {
        kind: 'checked',
        type: t.string,
      },
      value: {
        kind: 'checked',
        type: COST_ATTACHMENT_VALUE,
      },
    },
  },
  idField: 'id',
  paranoid: false,
});
