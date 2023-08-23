import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { FLOW_ID } from './flow';
import { FLOW_OBJECT_REF_DIRECTION } from './flowObject';

export type ExternalDataId = Brand<
  number,
  { readonly s: unique symbol },
  'externalData.id'
>;

export const EXTERNAL_DATA_ID = brandedType<number, ExternalDataId>(t.number);

export const EXTERNAL_DATA_SYSTEM_ID = t.keyof({
  CERF: null,
  EDRIS: null,
  IATI: null,
  OCT: null,
  'OCT-CERF': null,
});

export const EXTERNAL_DATA_OBJECT_TYPE = t.keyof({
  emergency: null,
  globalCluster: null,
  linkedFlow: null,
  location: null,
  organization: null,
  plan: null,
  project: null,
});

export default defineIDModel({
  tableName: 'externalData',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: EXTERNAL_DATA_ID },
    },
    required: {
      flowID: { kind: 'branded-integer', brand: FLOW_ID },
      versionID: { kind: 'checked', type: t.number },
      systemID: { kind: 'checked', type: EXTERNAL_DATA_SYSTEM_ID },
      objectType: { kind: 'checked', type: EXTERNAL_DATA_OBJECT_TYPE },
      data: { kind: 'checked', type: t.string },
    },
    optional: {
      externalRefID: { kind: 'checked', type: t.string },
      externalRefDate: { kind: 'checked', type: DATE },
      refDirection: { kind: 'checked', type: FLOW_OBJECT_REF_DIRECTION },
      matched: { kind: 'checked', type: t.boolean },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
