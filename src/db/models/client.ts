import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type ClientId = Brand<
  number,
  { readonly s: unique symbol },
  'client.id'
>;

export const CLIENT_ID = brandedType<number, ClientId>(t.number);

export default defineIDModel({
  tableName: 'client',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: CLIENT_ID },
    },
    required: {
      clientId: { kind: 'checked', type: t.string },
      clientSecret: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
