import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type GlobalClusterId = Brand<
  number,
  { readonly s: unique symbol },
  'globalCluster.id'
>;

export const GLOBAL_CLUSTER_ID = brandedType<number, GlobalClusterId>(t.number);
