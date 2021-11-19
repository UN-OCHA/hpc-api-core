import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type OrganizationId = Brand<
  number,
  { readonly s: unique symbol },
  'organization.id'
>;

export const ORGANIZATION_ID = brandedType<number, OrganizationId>(t.number);

export default defineIDModel({
  tableName: 'organization',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: ORGANIZATION_ID },
    },
    nonNullWithDefault: {
      active: { kind: 'checked', type: t.boolean },
      collectiveInd: { kind: 'checked', type: t.boolean },
      verified: { kind: 'checked', type: t.boolean },
    },
    optional: {
      nativeName: { kind: 'checked', type: t.string },
      url: { kind: 'checked', type: t.string },
      parentID: { kind: 'branded-integer', brand: ORGANIZATION_ID },
      comments: { kind: 'checked', type: t.string },
      newOrganizationId: { kind: 'branded-integer', brand: ORGANIZATION_ID },
      notes: { kind: 'checked', type: t.string },
    },
    required: {
      name: { kind: 'checked', type: t.string },
    },
    accidentallyOptional: {
      abbreviation: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
