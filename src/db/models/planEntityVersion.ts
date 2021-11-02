import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type PlanEntityVersionId = Brand<
  number,
  { readonly s: unique symbol },
  'planEntityVersion.id'
>;

export const PLAN_ENTITY_VERSION_ID = brandedType<number, PlanEntityVersionId>(
  t.number
);
