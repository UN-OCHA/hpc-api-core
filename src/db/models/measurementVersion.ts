import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineLegacyVersionedModel } from '../util/legacy-versioned-model';
import { MEASUREMENT_VALUE } from './json/indicatorsAndCaseloads';
import { MEASUREMENT_ID } from './measurement';

export type MeasurementVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'measurementVersion.id'
>;

export const MEASUREMENT_VERSION_ID = brandedType<number, MeasurementVersionId>(
  t.number
);

export default defineLegacyVersionedModel({
  tableName: 'measurementVersion',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: MEASUREMENT_VERSION_ID },
    },
    required: {
      measurementId: { kind: 'branded-integer', brand: MEASUREMENT_ID },
      value: { kind: 'checked', type: MEASUREMENT_VALUE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
