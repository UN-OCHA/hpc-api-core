import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type PlanEntityId = Brand<
  number,
  { readonly s: unique symbol },
  'planEntity.id'
>;

export const PLAN_ENTITY_ID = brandedType<number, PlanEntityId>(t.number);
