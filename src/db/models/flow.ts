import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';

export type FlowId = Brand<number, { readonly s: unique symbol }, 'flow.id'>;

export const FLOW_ID = brandedType<number, FlowId>(t.number);
