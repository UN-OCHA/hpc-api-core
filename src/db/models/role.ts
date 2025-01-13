import * as t from 'io-ts';
import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type RoleId = Brand<number, { readonly s: unique symbol }, 'role.id'>;

export const ROLE_ID = brandedType<number, RoleId>(t.number);

export const TARGET_TYPE = t.array(t.string);

export default defineIDModel({
  tableName: 'role',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: ROLE_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      description: { kind: 'checked', type: t.string },
    },
    targetTypes: {
      kind: 'checked',
      type: TARGET_TYPE,
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
