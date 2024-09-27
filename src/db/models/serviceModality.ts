import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type ServiceModalityId = Brand<
  number,
  { readonly s: unique symbol },
  'serviceModality.id'
>;

export const SERVICE_MODALITY_ID = brandedType<number, ServiceModalityId>(
  t.number
);

export default defineIDModel({
  tableName: 'serviceModality',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: SERVICE_MODALITY_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
