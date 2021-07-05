import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import { Brand } from '../../util/types';

export type PlanId = Brand<number, { readonly s: unique symbol }, 'plan.id'>;

export const PLAN_ID = brandedType<number, PlanId>(t.number);
