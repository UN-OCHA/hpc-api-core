import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineIDModel } from '../util/id-model';
import { PARTICIPANT_ID } from './participant';

export type EndpointLogId = Brand<
  number,
  { readonly s: unique symbol },
  'endpointLog.id'
>;

export const ENDPOINT_LOG_ID = brandedType<number, EndpointLogId>(t.number);

export const ENDPOINT_LOG_ENTITY_TYPE = t.keyof({
  attachment: null,
  attachmentPrototype: null,
  blueprint: null,
  conditionField: null,
  disaggregationModel: null,
  emergency: null,
  entityPrototype: null,
  fileAssetEntity: null,
  flow: null,
  governingEntity: null,
  measurement: null,
  organization: null,
  participant: null,
  plan: null,
  planEntity: null,
  planReportingPeriod: null,
  procedureEntityPrototype: null,
  procedureSection: null,
  project: null,
  'project comments': null,
});

export const ENDPOINT_LOG_EDIT_TYPE = t.keyof({
  creation: null,
  delete: null,
  deletion: null,
  merge: null,
  update: null,
});

export default defineIDModel({
  tableName: 'endpointLog',
  fields: {
    generated: {
      id: { kind: 'branded-integer', brand: ENDPOINT_LOG_ID },
    },
    required: {
      participantId: { kind: 'branded-integer', brand: PARTICIPANT_ID },
      entityType: { kind: 'checked', type: ENDPOINT_LOG_ENTITY_TYPE },
      entityId: { kind: 'checked', type: t.number },
      editType: { kind: 'checked', type: ENDPOINT_LOG_EDIT_TYPE },
      value: { kind: 'checked', type: t.unknown },
    },
  },
  idField: 'id',
  softDeletionEnabled: false,
});
