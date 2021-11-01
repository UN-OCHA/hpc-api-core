import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type BlueprintId = Brand<
  number,
  { readonly s: unique symbol },
  'blueprint.id'
>;

export const BLUEPRINT_ID = brandedType<number, BlueprintId>(t.number);
