import * as t from 'io-ts';

import type { Brand } from '../../util/types';
import { defineVersionedModel } from '../util/versioned-model';
import { brandedType } from '../../util/io-ts';

export type OrganizationId = Brand<
  number,
  { readonly s: unique symbol },
  'organizationv2.id'
>;

export const ORGANIZATION_ID = brandedType<number, OrganizationId>(t.number);

export const ORGANIZATION_DATA = t.type({
  id: ORGANIZATION_ID,
  name: t.string,
  nativeName: t.string,
  abbreviation: t.string,
  url: t.string,
  parentID: ORGANIZATION_ID,
  comments: t.string,
  verified: t.boolean,
  notes: t.string,
  active: t.boolean,
  collectiveInd: t.boolean,
  newOrganizationId: ORGANIZATION_ID,
});

export type OrganizationData = t.TypeOf<typeof ORGANIZATION_DATA>;

export default defineVersionedModel({
  tableBaseName: 'organization',
  idType: ORGANIZATION_ID,
  data: ORGANIZATION_DATA,
  lookupColumns: {
    columns: {
      required: {
        id: {
          kind: 'branded-integer',
          brand: ORGANIZATION_ID,
        },
        parentID: {
          kind: 'branded-integer',
          brand: ORGANIZATION_ID,
        },
        name: {
          kind: 'checked',
          type: t.string,
        },
        abbreviation: {
          kind: 'checked',
          type: t.string,
        },
      },
    },
    prepare: async (data) => {
      return data;
    },
  },
});
