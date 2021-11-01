import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type PlanLocationId = Brand<
  number,
  { readonly s: unique symbol },
  'planLocation.id'
>;

export const PLAN_LOCATION_ID = brandedType<number, PlanLocationId>(t.number);
