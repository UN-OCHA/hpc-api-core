import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
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
      releasedDate: { kind: 'checked', type: DATE },
    },
    nonNullWithDefault: {
      isReleased: { kind: 'checked', type: t.boolean },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
