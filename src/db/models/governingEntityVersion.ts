import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { GOVERNING_ENTITY_ID } from './governingEntity';

export type GoverningEntityVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'governingEntityVersion.id'
>;

export const GOVERNING_ENTITY_VERSION_ID = brandedType<
  number,
  GoverningEntityVersionId
>(t.number);

export default defineLegacyVersionedModel({
  tableName: 'governingEntityVersion',
  fields: {
    generated: {
      id: {
        kind: 'branded-integer',
        brand: GOVERNING_ENTITY_VERSION_ID,
      },
    },
    optional: { tags: { kind: 'checked', type: t.array(t.string) } },
    accidentallyOptional: {
      governingEntityId: {
        kind: 'branded-integer',
        brand: GOVERNING_ENTITY_ID,
      },
      name: { kind: 'checked', type: t.string },
      customReference: { kind: 'checked', type: t.string },
      value: { kind: 'checked', type: t.unknown },
    },
    nonNullWithDefault: {
      overriding: {
        kind: 'checked',
        type: t.boolean,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
