import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';

export type GlobalClusterId = Brand<
  number,
  { readonly s: unique symbol },
  'globalCluster.id'
>;

export const GLOBAL_CLUSTER_ID = brandedType<number, GlobalClusterId>(t.number);

export const GLOBAL_CLUSTER_TYPE = t.keyof({
  global: null,
  aor: null,
  custom: null,
});

export default defineIDModel({
  tableName: 'globalCluster',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: GLOBAL_CLUSTER_ID },
    },
    required: {
      type: { kind: 'checked', type: GLOBAL_CLUSTER_TYPE },
      name: { kind: 'checked', type: t.string },
      code: { kind: 'checked', type: t.string },
    },
    optional: {
      hrinfoId: { kind: 'checked', type: t.number },
      homepage: { kind: 'checked', type: t.string },
      parentId: { kind: 'branded-integer', brand: GLOBAL_CLUSTER_ID },
      defaultIconId: { kind: 'checked', type: t.string },
      displayFTSSummariesFromYear: { kind: 'checked', type: t.number },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
