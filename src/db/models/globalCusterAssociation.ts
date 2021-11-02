import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type GlobalClusterAssociationId = Brand<
  number,
  { readonly s: unique symbol },
  'globalClusterAssociation.id'
>;

export const GLOBAL_CLUSTER_ASSOCIATION_ID = brandedType<
  number,
  GlobalClusterAssociationId
>(t.number);
