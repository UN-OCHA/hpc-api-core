import * as t from 'io-ts';
import { brandedType } from '../../util/io-ts';

import type { Brand } from '../../util/types';
import { defineVersionedModel } from '../util/versioned-model';
import { GOVERNING_ENTITY_ID } from './governingEntity';
import { OPERATION_ID } from './operation';

export type OperationClusterId = Brand<
  number,
  { readonly s: unique symbol },
  'operationCluster.id'
>;

export const OPERATION_CLUSTER_ID = brandedType<number, OperationClusterId>(
  t.number
);

export const OPERATION_CLUSTER_DATA = t.intersection([
  t.type({
    operation: OPERATION_ID,
    abbreviation: t.string,
    name: t.string,
  }),
  t.partial({
    /**
     * A list of any governing entities that this cluster is associated with.
     *
     * Eventually, plan "governing entities" (i.e. clusters) will be descendants
     * of operationClusters, but until that happens, we use this field to track
     * the association.
     *
     * (doing this, though less efficient, allows us some flexibility,
     * and avoids the need for additional migrations). If this link becomes
     * needed for more regular lookups (e.g. auth calculations), then we should
     * add a lookup Column / or move the data to a column in governingEntity.
     */
    governingEntities: t.array(GOVERNING_ENTITY_ID),
  }),
]);

export default defineVersionedModel({
  tableBaseName: 'operationCluster',
  idType: OPERATION_CLUSTER_ID,
  data: OPERATION_CLUSTER_DATA,
  lookupColumns: {
    columns: {
      required: {
        operationId: {
          kind: 'branded-integer',
          brand: OPERATION_ID,
        },
      },
    },
    prepare: async (data) => ({
      operationId: data.operation,
    }),
  },
});
