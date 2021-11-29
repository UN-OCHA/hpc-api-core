import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type TagId = Brand<number, { readonly s: unique symbol }, 'tag.id'>;

export const TAG_ID = brandedType<number, TagId>(t.number);

export default defineIDModel({
  tableName: 'tag',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: TAG_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
