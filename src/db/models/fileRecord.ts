import * as t from 'io-ts';

import { defineSequelizeModel } from '../util/sequelize-model';

export default defineSequelizeModel({
  tableName: 'fileRecord',
  fields: {
    required: {
      /**
       * A JSON-stringified namespace.
       *
       * It was considered that this should also be a hash of the namespace,
       * however it was decided that we could leave it simply as a string of the
       * namespace to make it easy to identify the namespace by inspecting the
       * database contents.
       */
      hash: { kind: 'checked', type: t.string },
      /**
       * A SHA-256 hash of the file contents that are being saved.
       */
      namespace: { kind: 'checked', type: t.string },
    },
  },
  softDeletionEnabled: false,
});
