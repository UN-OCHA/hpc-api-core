import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ProjectContactId = Brand<
  number,
  { readonly s: unique symbol },
  'projectContact.id'
>;

export const PROJECT_CONTACT_ID = brandedType<number, ProjectContactId>(
  t.number
);
