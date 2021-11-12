import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { GLOBAL_CLUSTER_ID } from './globalCluster';
import { GOVERNING_ENTITY_ID } from './governingEntity';

export type GlobalClusterAssociationId = Brand<
  number,
  { readonly s: unique symbol },
  'globalClusterAssociation.id'
>;

export const GLOBAL_CLUSTER_ASSOCIATION_ID = brandedType<
  number,
  GlobalClusterAssociationId
>(t.number);

export default defineIDModel({
  tableName: 'globalClusterAssociation',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: GLOBAL_CLUSTER_ASSOCIATION_ID },
    },
    required: {
      globalClusterId: { kind: 'branded-integer', brand: GLOBAL_CLUSTER_ID },
      governingEntityId: {
        kind: 'branded-integer',
        brand: GOVERNING_ENTITY_ID,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
