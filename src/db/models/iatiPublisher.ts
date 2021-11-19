import * as t from 'io-ts';

import { brandedType } from '../../util/io-ts';
import type { Brand } from '../../util/types';
import { DATE } from '../util/datatypes';
import { defineSequelizeModel } from '../util/sequelize-model';

export type IatiPublisherId = Brand<
  string,
  { readonly s: unique symbol },
  'iatiPublisher.id'
>;
export const IATI_PUBLISHER_ID = brandedType<string, IatiPublisherId>(t.string);

export const IATI_PUBLISHER_FETCH_STATUS = {
  downloaded: null,
  downloading: null,
  halted: null,
  queued: null,
};

export default defineSequelizeModel({
  tableName: 'iatiPublisher',
  fields: {
    required: {
      id: { kind: 'branded-integer', brand: IATI_PUBLISHER_ID },
      name: { kind: 'checked', type: t.string },
      organizationType: { kind: 'checked', type: t.literal('organization') },
      datasets: { kind: 'checked', type: t.number },
    },
    nonNullWithDefault: {
      active: { kind: 'checked', type: t.boolean },
      fetchStatus: { kind: 'enum', values: IATI_PUBLISHER_FETCH_STATUS },
    },
    optional: {
      queuedAt: { kind: 'checked', type: DATE },
      lastFetchedAt: { kind: 'checked', type: DATE },
      country: { kind: 'checked', type: t.string },
      xmlData: { kind: 'checked', type: t.string },
    },
  },
  softDeletionEnabled: true,
});
