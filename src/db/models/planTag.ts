import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PLAN_ID } from './plan';

export type PlanTagId = Brand<
  number,
  { readonly s: unique symbol },
  'planTag.id'
>;

export const PLAN_TAG_ID = brandedType<number, PlanTagId>(t.number);

const PLAN_TAG_PUBLISH_TYPE = t.keyof({
  major: null,
  minor: null,
  custom: null,
});

export const PLAN_TAG_REVISION_STATE = t.keyof({
  none: null,
  planDataAndProjects: null,
  planDataOnly: null,
  projectsOnly: null,
});

export default defineIDModel({
  tableName: 'planTag',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PLAN_TAG_ID },
    },
    required: {
      planId: { kind: 'branded-integer', brand: PLAN_ID },
      name: { kind: 'checked', type: t.string },
    },
    nonNullWithDefault: {
      public: { kind: 'checked', type: t.boolean },
      reportingPeriods: { kind: 'checked', type: t.array(t.number) },
    },
    optional: {
      comment: { kind: 'checked', type: t.string },
      revisionState: { kind: 'checked', type: PLAN_TAG_REVISION_STATE },
      type: { kind: 'checked', type: PLAN_TAG_PUBLISH_TYPE },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
