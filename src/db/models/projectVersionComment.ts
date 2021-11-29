import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PARTICIPANT_ID } from './participant';
import { PROJECT_VERSION_PLAN_ID } from './projectVersionPlan';

export type ProjectVersionCommentId = Brand<
  number,
  { readonly s: unique symbol },
  'projectVersionComment.id'
>;

export const PROJECT_VERSION_COMMENT_ID = brandedType<
  number,
  ProjectVersionCommentId
>(t.number);

export default defineIDModel({
  tableName: 'projectVersionComment',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: PROJECT_VERSION_COMMENT_ID },
    },
    required: {
      content: { kind: 'checked', type: t.string },
      participantId: { kind: 'branded-integer', brand: PARTICIPANT_ID },
      projectVersionPlanId: {
        kind: 'branded-integer',
        brand: PROJECT_VERSION_PLAN_ID,
      },
    },
    optional: {
      step: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
