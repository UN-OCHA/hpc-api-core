import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type TagId = Brand<number, { readonly s: unique symbol }, 'tag.id'>;

export const TAG_ID = brandedType<number, TagId>(t.number);
