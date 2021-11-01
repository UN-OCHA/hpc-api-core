import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type OrganizationId = Brand<
  number,
  { readonly s: unique symbol },
  'organization.id'
>;

export const ORGANIZATION_ID = brandedType<number, OrganizationId>(t.number);
