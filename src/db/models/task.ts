import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PARTICIPANT_ID } from './participant';

export type TaskId = Brand<number, { readonly s: unique symbol }, 'task.id'>;

export const TASK_ID = brandedType<number, TaskId>(t.number);

export default defineIDModel({
  tableName: 'task',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: TASK_ID },
    },
    nonNullWithDefault: {
      run: { kind: 'checked', type: t.boolean },
    },
    required: {
      command: { kind: 'checked', type: t.string },
      requester: { kind: 'branded-integer', brand: PARTICIPANT_ID },
      dataFileHash: { kind: 'checked', type: t.string },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
