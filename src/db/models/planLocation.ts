import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { LOCATION_ID } from './location';
import { PLAN_ID } from './plan';

export type PlanLocationId = Brand<
  number,
  { readonly s: unique symbol },
  'planLocation.id'
>;

export const PLAN_LOCATION_ID = brandedType<number, PlanLocationId>(t.number);

export default defineLegacyVersionedModel({
  tableName: 'planLocation',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PLAN_LOCATION_ID },
    },
    required: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
      locationId: { kind: 'branded-integer', brand: LOCATION_ID },
    },
  },
  idField: 'id',
  softDeletionEnabled: true,
});
