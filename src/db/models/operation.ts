import * as t from 'io-ts';

import type { Brand } from '../../util/types';
import { PLAN_ID } from './plan';
import { defineVersionedModel } from '../util/versioned-model';
import { brandedType } from '../../util/io-ts';

export type OperationId = Brand<
  number,
  { readonly s: unique symbol },
  'operation.id'
>;

export const OPERATION_ID = brandedType<number, OperationId>(t.number);

export const OPERATION_DATA = t.intersection([
  t.type({
    name: t.string,
    /**
     * TODO: Change to ID type
     */
    locations: t.array(t.number),
    /**
     * TODO: Change to ID type
     */
    emergencies: t.array(t.number),
  }),
  t.partial({
    /**
     * A list of any plans that are associated with this operation.
     *
     * Eventually, plans will be descendants of operations,
     * but until that happens, we use this field to track the association.
     *
     * (doing this, though less efficient, allows us some flexibility,
     * and avoids the need for additional migrations). If this link becomes
     * needed for more regular lookups (e.g. auth calculations), then we should
     * add a lookup Column / or move the data to a column in plan.
     */
    plans: t.array(PLAN_ID),
  }),
]);

export default defineVersionedModel({
  tableBaseName: 'operation',
  idType: OPERATION_ID,
  data: OPERATION_DATA,
  lookupColumns: {
    columns: {},
    prepare: async () => ({}),
  },
});
