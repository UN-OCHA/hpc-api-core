import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

import { defineIDModel } from '../util/id-model';

export type LookupId = Brand<
  number,
  { readonly s: unique symbol },
  'lookup.id'
>;

export const LOOKUP_ID = brandedType<number, LookupId>(t.number);

export const OUTPUT_FIELD = t.keyof({
  FLOW_STATUS: null,
  ORGANIZATION_DIRECT: null,
  ORGANIZATION_INTERSECTION: null,
  LOCATION: null,
});

export const INPUT_FIELD = t.keyof({
  DONOR: null,
  FUNDING_SOURCE: null,
  ALLOCATION_STATUS: null,
  IMIS_CODE: null,
});

export default defineIDModel({
  tableName: 'lookup',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: LOOKUP_ID },
    },
    required: {
      input: { kind: 'checked', type: t.string },
      inputField: { kind: 'checked', type: INPUT_FIELD },
      output: { kind: 'checked', type: t.string },
      outputField: { kind: 'checked', type: OUTPUT_FIELD },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
