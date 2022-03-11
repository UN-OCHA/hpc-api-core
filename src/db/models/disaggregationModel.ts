import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { LOCATION_ID } from './location';
import { PLAN_ID } from './plan';

export type DisaggregationModelId = Brand<
  number,
  { readonly s: unique symbol },
  'disaggregationModel.id'
>;

export const DISAGGREGATION_MODEL_ID = brandedType<
  number,
  DisaggregationModelId
>(t.number);

export const DISAGGREGATION_MODEL_CREATOR = t.intersection([
  t.type({
    participantHidId: t.string,
  }),
  t.partial({
    roles: t.array(t.string),
  }),
]);

const LOCATION_INFO = t.intersection([
  t.type({ name: t.string }),
  t.partial({
    /**
     * Like in many places throughout the codebase, location IDs
     * might use `pcode` instead of actual numeric ID
     *
     * Also, some locations are missing ID completely
     */
    id: t.union([LOCATION_ID, t.string]),
  }),
]);

export const DISAGGREGATION_MODEL_VALUE = t.type({
  categories: t.array(
    t.type({
      ids: t.array(t.number),
      name: t.string,
      label: t.string,
    })
  ),
  locations: t.array(
    t.intersection([LOCATION_INFO, t.partial({ parent: LOCATION_INFO })])
  ),
  status: t.boolean,
});

export default defineIDModel({
  tableName: 'disaggregationModel',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: DISAGGREGATION_MODEL_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      creator: { kind: 'checked', type: DISAGGREGATION_MODEL_CREATOR },
      value: { kind: 'checked', type: DISAGGREGATION_MODEL_VALUE },
      planId: { kind: 'checked', type: PLAN_ID },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
