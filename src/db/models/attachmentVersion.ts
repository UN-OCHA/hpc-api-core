import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { ATTACHMENT_ID } from './attachment';
import { ANY_ATTACHMENT_VERSION_VALUE } from './json/attachment';

export type AttachmentVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'attachmentVersion.id'
>;

export const ATTACHMENT_VERSION_ID = brandedType<number, AttachmentVersionId>(
  t.number
);

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
    required: {
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
        type: ANY_ATTACHMENT_VERSION_VALUE,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
