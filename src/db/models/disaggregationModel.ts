import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { LOCATION_ID } from './location';
import { PARTICIPANT_ID } from './participant';
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

/**
 * Strict version of `LOCATION_INFO` codec defined above.
 * Intended to be used when creating new records, in order
 * to enforce stricter type of location ID.
 */
const LOCATION_INFO_STRICT = t.intersection([
  LOCATION_INFO.types[0],
  t.partial({ id: LOCATION_ID }),
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

/**
 * Strict version of `DISAGGREGATION_MODEL_VALUE` codec defined above.
 * Intended to be used when creating new records, in order to enforce
 * stricter type of location ID.
 *
 * Location ID used to allow for string type, which is why there are
 * many records using location's pcode instead of ID. This stricter
 * type should be used for validating new records upon creation.
 */
export const DISAGGREGATION_MODEL_VALUE_STRICT = t.type({
  categories: DISAGGREGATION_MODEL_VALUE.props.categories,
  status: DISAGGREGATION_MODEL_VALUE.props.status,
  locations: t.array(
    t.intersection([
      LOCATION_INFO_STRICT,
      t.partial({ parent: LOCATION_INFO_STRICT }),
    ])
  ),
});

export default defineIDModel({
  tableName: 'disaggregationModel',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: DISAGGREGATION_MODEL_ID },
    },
    required: {
      name: { kind: 'checked', type: t.string },
      value: { kind: 'checked', type: DISAGGREGATION_MODEL_VALUE },
      creatorParticipantId: { kind: 'branded-integer', brand: PARTICIPANT_ID },
      planId: { kind: 'checked', type: PLAN_ID },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
