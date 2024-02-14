import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineIDModel } from '../util/id-model';
import { EXTERNAL_DATA_SYSTEM_ID } from './externalData';
import { FLOW_ID } from './flow';

export type ExternalReferenceId = Brand<
  number,
  { readonly s: unique symbol },
  'externalReference.id'
>;

export const EXTERNAL_REFERENCE_ID = brandedType<number, ExternalReferenceId>(
  t.number
);

export const EXTERNAL_REFERENCE_IMPORT_INFORMATION = t.partial({
  inferred: t.array(
    t.intersection([
      t.type({
        key: t.string,
        reason: t.string,
      }),
      t.partial({
        valueId: t.number,
      }),
    ])
  ),
  transferred: t.array(
    t.intersection([
      t.type({
        key: t.string,
      }),
      t.partial({
        valueId: t.number,
      }),
    ])
  ),
});

export default defineIDModel({
  tableName: 'externalReference',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: EXTERNAL_REFERENCE_ID },
    },
    required: {
      systemID: { kind: 'checked', type: EXTERNAL_DATA_SYSTEM_ID },
      flowID: { kind: 'checked', type: FLOW_ID },
      externalRecordID: { kind: 'checked', type: t.string },
      externalRecordDate: { kind: 'checked', type: DATE },
    },
    optional: {
      versionID: { kind: 'checked', type: t.number },
      importInformation: {
        kind: 'checked',
        type: EXTERNAL_REFERENCE_IMPORT_INFORMATION,
      },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
