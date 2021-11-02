import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type IatiRecipientCountryId = Brand<
  number,
  { readonly s: unique symbol },
  'iatiRecipientCountry.id'
>;

export const IATI_RECIPIENT_COUNTRY_ID = brandedType<
  number,
  IatiRecipientCountryId
>(t.number);
