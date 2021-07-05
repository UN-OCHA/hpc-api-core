import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type AttachmentPrototypeId = Brand<
  number,
  { readonly s: unique symbol },
  'attachmentPrototype.id'
>;

export const ATTACHMENT_PROTOTYPE_ID = brandedType<
  number,
  AttachmentPrototypeId
>(t.number);
