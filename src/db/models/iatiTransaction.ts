import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type IatiTransactionId = Brand<
  number,
  { readonly s: unique symbol },
  'iatiTransaction.id'
>;

export const IATI_TRANSACTION_ID = brandedType<number, IatiTransactionId>(
  t.number
);
