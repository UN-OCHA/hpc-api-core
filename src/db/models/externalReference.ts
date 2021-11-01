import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ExternalReferenceId = Brand<
  number,
  { readonly s: unique symbol },
  'externalReference.id'
>;

export const EXTERNAL_REFERENCE_ID = brandedType<number, ExternalReferenceId>(
  t.number
);
