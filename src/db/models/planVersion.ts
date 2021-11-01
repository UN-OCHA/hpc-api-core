import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type PlanVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'planVersion.id'
>;

export const PLAN_VERSION_ID = brandedType<number, PlanVersionId>(t.number);
