import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ConditionFieldId = Brand<
  number,
  { readonly s: unique symbol },
  'conditionField.id'
>;

export const CONDITION_FIELD_ID = brandedType<number, ConditionFieldId>(
  t.number
);
