import * as t from 'io-ts';

import type { Brand } from '../../util/types';
import { defineVersionedModel } from '../util/versioned-model';

import { OperationId, OPERATION_ID } from './operation';
import { FILE_REFERENCE } from '../util/datatypes';
import operationCluster, { OPERATION_CLUSTER_ID } from './operationCluster';
import { REPORTING_WINDOW_ID } from './reportingWindow';
import { FORM_ID } from './form';
import { brandedType } from '../../util/io-ts';

export type ReportingWindowAssignmentId = Brand<
  number,
  { readonly s: unique symbol },
  'reportingWindowAssignment.id'
>;

export const REPORTING_WINDOW_ASSIGNMENT_ID = brandedType<
  number,
  ReportingWindowAssignmentId
>(t.number);

export const REPORTING_WINDOW_ASSIGNMENT_FILE = t.type({
  name: t.string,
  data: FILE_REFERENCE,
});

export const REPORTING_WINDOW_ASSIGNMENT_FILES = t.array(
  REPORTING_WINDOW_ASSIGNMENT_FILE
);

export const REPORTING_WINDOW_ASSIGNMENT_STATE = t.union([
  t.null,
  t.type({
    type: t.keyof({
      raw: null,
      clean: null,
    }),
    finalized: t.boolean,
    data: t.string,
    files: t.union([REPORTING_WINDOW_ASSIGNMENT_FILES, t.undefined]),
  }),
]);

export type ReportingWindowAssignmentState = t.TypeOf<
  typeof REPORTING_WINDOW_ASSIGNMENT_STATE
>;

export const REPORTING_WINDOW_ASSIGNEE_TYPE = t.union([
  t.type({
    type: t.literal('operation'),
    operation: OPERATION_ID,
  }),
  t.type({
    type: t.literal('operationCluster'),
    cluster: OPERATION_CLUSTER_ID,
  }),
]);

export type ReportingWindowAssigneeType = t.TypeOf<
  typeof REPORTING_WINDOW_ASSIGNEE_TYPE
>;

export const REPORTING_WINDOW_ASSIGNMENT_DATA = t.type({
  reportingWindowId: REPORTING_WINDOW_ID,
  assignee: REPORTING_WINDOW_ASSIGNEE_TYPE,
  task: t.type({
    type: t.literal('form'),
    form: FORM_ID,
    formName: t.string,
    formVersion: t.number,
    state: REPORTING_WINDOW_ASSIGNMENT_STATE,
  }),
});

export type ReportingWindowAssignmentData = t.TypeOf<
  typeof REPORTING_WINDOW_ASSIGNMENT_DATA
>;

export default defineVersionedModel({
  tableBaseName: 'reportingWindowAssignment',
  idType: REPORTING_WINDOW_ASSIGNMENT_ID,
  data: REPORTING_WINDOW_ASSIGNMENT_DATA,
  lookupColumns: {
    columns: {
      required: {
        reportingWindowId: {
          kind: 'branded-integer',
          brand: REPORTING_WINDOW_ID,
        },
        assigneeOperation: {
          kind: 'branded-integer',
          brand: OPERATION_ID,
        },
        assigneeType: {
          kind: 'enum',
          values: {
            operation: null,
            operationCluster: null,
          },
        },
        assigneeId: {
          kind: 'checked',
          type: t.number,
        },
      },
    },
    prepare: async (data, conn) => {
      let assigneeOperation: OperationId;
      let assigneeId: number;
      if (data.assignee.type === 'operation') {
        assigneeOperation = data.assignee.operation;
        assigneeId = data.assignee.operation;
      } else if (data.assignee.type === 'operationCluster') {
        const oc = operationCluster(conn);
        const cluster = await oc.get(data.assignee.cluster);
        if (!cluster) {
          throw new Error(
            `Could not find cluster with ID ${data.assignee.cluster}`
          );
        }
        assigneeOperation = cluster.data.operation;
        assigneeId = data.assignee.cluster;
      } else {
        throw new Error('Unknown assignee type');
      }

      return {
        reportingWindowId: data.reportingWindowId,
        assigneeOperation,
        assigneeType: data.assignee.type,
        assigneeId,
      };
    },
  },
});
