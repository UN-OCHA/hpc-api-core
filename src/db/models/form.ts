import * as t from 'io-ts';

import type { Brand } from '../../util/types';
import { defineVersionedModel } from '../util/versioned-model';

import { brandedType } from '../../util/io-ts';
import { FILE_REFERENCE } from '../util/datatypes';
import { OPERATION_ID } from './operation';

export type FormId = Brand<number, { readonly s: unique symbol }, 'form.id'>;

export const FORM_ID = brandedType<number, FormId>(t.number);

export const FORM_DATA = t.type({
  name: t.string,
  belongsTo: t.union([
    t.type({
      type: t.literal('global'),
    }),
    t.type({
      type: t.literal('operation'),
      operation: OPERATION_ID,
    }),
  ]),
  definition: FILE_REFERENCE,
});

export default defineVersionedModel({
  tableBaseName: 'form',
  idType: FORM_ID,
  data: FORM_DATA,
  lookupColumns: {
    columns: {
      required: {
        belongsToType: {
          kind: 'enum',
          values: {
            global: null,
            operation: null,
          },
        },
      },
      optional: {
        belongsToId: {
          kind: 'checked',
          type: t.number,
        },
      },
    },
    prepare: (data) =>
      Promise.resolve({
        belongsToType: data.belongsTo.type,
        belongsToId:
          data.belongsTo.type === 'operation'
            ? data.belongsTo.operation
            : undefined,
      }),
  },
});
