import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type MeasurementId = Brand<
  number,
  { readonly s: unique symbol },
  'measurement.id'
>;

export const MEASUREMENT_ID = brandedType<number, MeasurementId>(t.number);
