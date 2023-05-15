import * as t from 'io-ts';
import { DATE } from '../util/datatypes';
import { defineSequelizeModel } from '../util/sequelize-model';

/**
 * There are other job names in the DB, but they are no longer actively used
 */
export const HIGHWATER_JOB_NAME = t.keyof({
  ftsSolrIndexFlow: null,
  ftsSolrIndexProject: null,
});

export default defineSequelizeModel({
  tableName: 'highWater',
  fields: {
    required: {
      jobName: { kind: 'checked', type: HIGHWATER_JOB_NAME },
      timestamp: { kind: 'checked', type: DATE },
    },
  },
  softDeletionEnabled: false,
});
