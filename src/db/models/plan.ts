import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type PlanId = Brand<number, { readonly s: unique symbol }, 'plan.id'>;

export const PLAN_ID = brandedType<number, PlanId>(t.number);

export const PLAN_REVISION_STATE = t.keyof({
  none: null,
  planDataAndProjects: null,
  planDataOnly: null,
  projectsOnly: null,
});

export default defineIDModel({
  tableName: 'plan',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PLAN_ID },
    },
    required: {
      restricted: { kind: 'checked', type: t.boolean },
    },
    optional: {
      revisionState: { kind: 'checked', type: PLAN_REVISION_STATE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
