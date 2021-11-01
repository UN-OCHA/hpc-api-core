import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type MeasurementVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'measurementVersion.id'
>;

export const MEASUREMENT_VERSION_ID = brandedType<number, MeasurementVersionId>(
  t.number
);
