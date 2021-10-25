import * as t from 'io-ts';
import { DATE } from '../util/datatypes';
import { defineRawModel } from '../util/raw-model';

const EXPIRED_DATA_TYPE = {
  solr: null,
};

const EXPIRED_OBJECT_TYPE = {
  flow: null,
  project: null,
};

export default defineRawModel({
  tableName: 'expiredData',
  fields: {
    required: {
      refreshAfter: { kind: 'checked', type: DATE },
      objectId: { kind: 'checked', type: t.number },
      type: {
        kind: 'enum',
        values: EXPIRED_DATA_TYPE,
      },
      objectType: {
        kind: 'enum',
        values: EXPIRED_OBJECT_TYPE,
      },
    },
    optional: {},
  },
});
