import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type JobId = Brand<number, { readonly s: unique symbol }, 'job.id'>;

export const JOB_ID = brandedType<number, JobId>(t.number);
