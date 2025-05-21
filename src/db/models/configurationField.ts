import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { defineSequelizeModel } from '../util/sequelize-model';

export type ConfigurationFieldId = Brand<
  string,
  { readonly s: unique symbol },
  'configurationField.id'
>;

export const CONFIGURATION_FIELD_ID = brandedType<string, ConfigurationFieldId>(
  t.string
);

export default defineSequelizeModel({
  tableName: 'configurationField',
  fields: {
    required: {
      name: { kind: 'checked', type: CONFIGURATION_FIELD_ID },
      value: { kind: 'checked', type: t.string },
    },
  },
  softDeletionEnabled: true,
});
