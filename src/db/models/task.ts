import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type TaskId = Brand<number, { readonly s: unique symbol }, 'task.id'>;

export const TASK_ID = brandedType<number, TaskId>(t.number);
