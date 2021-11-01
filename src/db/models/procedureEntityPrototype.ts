import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ProcedureEntityPrototypeId = Brand<
  number,
  { readonly s: unique symbol },
  'procedureEntityPrototype.id'
>;

export const PROCEDURE_ENTITY_PROTOTYPE_ID = brandedType<
  number,
  ProcedureEntityPrototypeId
>(t.number);
