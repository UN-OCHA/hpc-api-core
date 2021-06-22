import merge = require('lodash/merge');
import * as t from 'io-ts';

import { FieldDefinition } from './model-definition';
import {
  ModelWithIdInitializer,
  FieldsWithId,
  defineIDModel,
} from './id-model';

const VERSIONED_FIELDS = {
  nonNullWithDefault: {
    currentVersion: {
      kind: 'checked',
      type: t.boolean,
    },
    latestVersion: {
      kind: 'checked',
      type: t.boolean,
    },
    latestTaggedVersion: {
      kind: 'checked',
      type: t.boolean,
    },
    versionTags: {
      kind: 'checked',
      type: t.array(t.string),
    },
  },
} as const;

type ExtendedFields<F extends FieldDefinition> = F & typeof VERSIONED_FIELDS;

export type FieldsWithVersioned<
  F extends FieldDefinition,
  Paranoid extends boolean
> = FieldsWithId<F, Paranoid> & ExtendedFields<F>;

/**
 * A model that has been defined using `versionLib.versionModel`
 *
 * This definition function extends the given table definition with columns that
 * are present on all models defined by the function `versionLib.versionModel`.
 */
export const defineLegacyVersionedModel = <
  F extends FieldDefinition,
  IDField extends keyof F['generated'],
  Paranoid extends boolean
>(opts: {
  tableName: string;
  fields: F;
  idField: IDField;
  paranoid: Paranoid;
}): ModelWithIdInitializer<FieldsWithVersioned<F, Paranoid>, IDField> => {
  const fields: ExtendedFields<F> = merge({}, opts.fields, VERSIONED_FIELDS);
  return defineIDModel({
    ...opts,
    fields,
  });
};
