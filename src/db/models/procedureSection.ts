import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type ProcedureSectionId = Brand<
  number,
  { readonly s: unique symbol },
  'procedureSection.id'
>;

export const PROCEDURE_SECTION_ID = brandedType<number, ProcedureSectionId>(
  t.number
);
