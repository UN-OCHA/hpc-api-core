import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ProjectId = Brand<
  number,
  { readonly s: unique symbol },
  'project.id'
>;

export const PROJECT_ID = brandedType<number, ProjectId>(t.number);
