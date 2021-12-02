/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use of `any` in this module is generally deliberate to help with generics
 */
import Knex = require('knex');
import merge = require('lodash/merge');
import * as t from 'io-ts';

import { Brand } from '../../util/types';

import { ConcurrentModificationError } from './errors';
import { defineSequelizeModel } from './sequelize-model';
import { ParticipantId, PARTICIPANT_ID } from '../models/participant';
import { FieldDefinition, UserDataOf } from './model-definition';
import { defineIDModel } from './id-model';
import { InstanceDataOfModel, ModelInternals, WhereCond } from './raw-model';
import { Op } from './conditions';

type LookupColumnDefinition = Pick<FieldDefinition, 'optional' | 'required'>;

type InstanceVersionData<Data> = {
  version: number;
  modifiedBy: ParticipantId | null;
  modifiedAt: Date;
  data: Data;
};

type VersionedInstance<IDType, Data> = InstanceVersionData<Data> & {
  id: IDType;
  update: (
    data: Data,
    modifiedBy: ParticipantId | null
  ) => Promise<VersionedInstance<IDType, Data>>;
};

type VersionedInstanceWithAllData<IDType, Data> = {
  id: IDType;
  currentVersion: number;
  versions: Array<InstanceVersionData<Data>>;
};

type RootColumnDefinition<
  IDType,
  LookupColumns extends LookupColumnDefinition
> = LookupColumns & {
  generated: {
    id: {
      kind: 'branded-integer';
      brand: t.Type<IDType>;
    };
  };
};

export type VersionedModel<
  IDType,
  Data,
  LookupColumns extends LookupColumnDefinition
> = {
  _internals: {
    type: 'versioned-model';
    root: ModelInternals<any>;
    versions: ModelInternals<any>;
    /**
     * Get the list of all tables that this model creates, and that need to be
     * cleared after / between unit tests that modify them.
     */
    tablesToClear: () => string[];
  };
  create: (
    data: Data,
    modifiedBy: ParticipantId | null
  ) => Promise<VersionedInstance<IDType, Data>>;
  /**
   * Transactionally update the entity, and return the new version.
   */
  update: (args: {
    id: IDType;
    /**
     * What is the expected current version of the entity.
     * This is used to prevent accidental overwrites by concurrent changes.
     */
    currentVersion: number;
    /**
     * What is the new data that the entity should contain.
     */
    data: Data;
    /**
     * Who was this modification made by?
     */
    modifiedBy: ParticipantId | null;
  }) => Promise<VersionedInstance<IDType, Data>>;
  findAll: (args?: {
    where?: WhereCond<RootColumnDefinition<IDType, LookupColumns>>;
  }) => Promise<Array<VersionedInstance<IDType, Data>>>;
  get: (id: IDType) => Promise<VersionedInstance<IDType, Data> | null>;
  getAll: (
    ids: Iterable<IDType>
  ) => Promise<Map<IDType, VersionedInstance<IDType, Data>>>;
  permanentlyDelete: (id: IDType) => Promise<void>;
  getAllVersions: (
    id: IDType
  ) => Promise<VersionedInstanceWithAllData<IDType, Data> | null>;
};

type VersionedModelInitializer<
  IDType,
  Data,
  LookupColumns extends LookupColumnDefinition
> = (conn: Knex) => VersionedModel<IDType, Data, LookupColumns>;

export type InstanceOfVersionedModel<M extends VersionedModel<any, any, any>> =
  M extends VersionedModel<infer IDType, infer Data, any>
    ? VersionedInstance<IDType, Data>
    : never;

const hasRootAndVersion = (
  data: unknown
): data is {
  root: unknown;
  version: unknown;
} => typeof data === 'object' && !!data && 'root' in data && 'version' in data;

export const defineVersionedModel =
  <
    IDType extends Brand<any, any, any>,
    Data,
    LookupColumns extends LookupColumnDefinition
  >(opts: {
    tableBaseName: string;
    idType: t.Type<IDType>;
    data: t.Type<Data>;
    lookupColumns: {
      columns: LookupColumns;
      prepare: (data: Data, conn: Knex) => Promise<UserDataOf<LookupColumns>>;
    };
  }): VersionedModelInitializer<IDType, Data, LookupColumns> =>
  (conn) => {
    const name = opts.tableBaseName;

    const rootFields = merge(
      {},
      {
        generated: {
          id: {
            kind: 'branded-integer',
            brand: opts.idType,
          },
        },
      } as const,
      opts.lookupColumns.columns
    );

    const rootModel = defineIDModel({
      tableName: name,
      idField: 'id',
      fields: rootFields,
      softDeletionEnabled: false,
    })(conn);

    const versionModel = defineSequelizeModel({
      tableName: `${name}Version`,
      softDeletionEnabled: false,
      fields: {
        required: {
          root: {
            kind: 'branded-integer',
            brand: opts.idType,
          },
          version: {
            kind: 'checked',
            type: t.number,
          },
          isLatest: {
            kind: 'checked',
            type: t.boolean,
          },
          data: {
            kind: 'checked',
            type: opts.data,
          },
        },
        optional: {
          modifiedBy: {
            kind: 'branded-integer',
            brand: PARTICIPANT_ID,
          },
        },
      },
      genIdentifier: (data) => {
        if (hasRootAndVersion(data)) {
          return `${name}Version ${data.root}-v${data.version}`;
        } else {
          return `unknown ${name}Version`;
        }
      },
    })(conn);

    const createInstance = ({
      root: { id },
      data,
      version,
    }: {
      root: { id: IDType };
      data: Data;
      version: InstanceDataOfModel<typeof versionModel>;
    }): VersionedInstance<IDType, Data> => {
      const instance: VersionedInstance<IDType, Data> = {
        id,
        version: version.version,
        modifiedBy: version.modifiedBy || null,
        modifiedAt: version.updatedAt,
        data,
        update: (data, modifiedBy) =>
          result.update({
            id,
            currentVersion: version.version,
            data,
            modifiedBy,
          }),
      };
      Object.defineProperty(instance, 'toString', {
        value: () => `${name}Version ${id}-v${version.version}`,
        writable: false,
        enumerable: false,
      });
      return instance;
    };

    const result: VersionedModel<IDType, Data, LookupColumns> = {
      _internals: {
        type: 'versioned-model',
        root: rootModel._internals,
        versions: versionModel._internals,
        tablesToClear: () => [`${name}Version`, name],
      },
      create: async (data, modifiedBy) => {
        const lookupData = await opts.lookupColumns.prepare(data, conn);

        const root = await rootModel.create(lookupData as any);

        const version = await versionModel.create({
          root: root.id,
          version: 1,
          modifiedBy: modifiedBy || undefined,
          isLatest: true,
          data,
        });

        return createInstance({ root, data, version });
      },
      findAll: async (args) => {
        const roots = await rootModel.find(args as any);
        const ids = new Set(roots.map((r) => r.id));
        const versionsList = await versionModel.find({
          where: {
            root: {
              [Op.IN]: ids,
            },
            isLatest: true,
          },
        });
        const versions = new Map(versionsList.map((v) => [v.root, v]));

        const results: Array<VersionedInstance<IDType, Data>> = [];

        for (const root of roots) {
          const version = versions.get(root.id);
          if (version) {
            results.push(
              createInstance({
                root,
                version,
                data: version.data,
              })
            );
          } else {
            // TODO: log these
          }
        }

        return results;
      },
      get: async (id) => {
        const getRoot = rootModel.findOne({
          where: { id } as any,
        });
        const getVersion = versionModel.findOne({
          where: {
            root: id,
            isLatest: true,
          },
        });
        const [root, version] = await Promise.all([getRoot, getVersion]);
        if (!root || !version) {
          return null;
        } else {
          return createInstance({
            root,
            version,
            data: version.data,
          });
        }
      },
      getAll: async (ids) => {
        const items = await result.findAll({
          where: {
            id: {
              [Op.IN]: ids as Iterable<any>,
            },
          },
        });
        const grouped = new Map<IDType, VersionedInstance<IDType, Data>>();
        for (const item of items) {
          grouped.set(item.id, item);
        }
        return grouped;
      },
      getAllVersions: async (id) => {
        const getRoot = rootModel.findOne({
          where: { id } as any,
        });
        const getVersions = versionModel.find({
          where: {
            root: id,
          },
        });
        const [root, versions] = await Promise.all([getRoot, getVersions]);
        if (!root || !versions) {
          // TODO: log invalid data
          return null;
        } else {
          versions.sort((a, b) => a.version - b.version);
          const processedVersions: Array<InstanceVersionData<Data>> = [];
          let currentVersion: null | number = null;
          for (const v of versions) {
            if (v.isLatest) {
              currentVersion = v.version;
            }
            processedVersions.push({
              version: v.version,
              modifiedBy: v.modifiedBy || null,
              modifiedAt: v.updatedAt,
              data: v.data,
            });
          }
          if (!currentVersion) {
            throw new Error(
              `Could not find latest version of ${name} with id ${id}`
            );
          }
          return {
            id: root.id,
            currentVersion,
            versions: processedVersions,
          };
        }
      },
      permanentlyDelete: async (id) => {
        const root = rootModel.findOne({
          where: { id } as any,
        });
        if (!root) {
          throw new Error(`Could not find ${name} with id ${id}`);
        } else {
          await versionModel.destroy({
            where: {
              root: id,
            },
          });
          await rootModel.destroy({
            where: { id } as any,
          });
        }
      },
      update: async (args) => {
        const { id, currentVersion, data, modifiedBy } = args;
        /**
         * Get the previous version of the entity.
         *
         * It's not necessary for this to be in the transaction because the
         * creation of a new version will fail if there's been another version
         * since this query,
         * as the new version will fail unique the primary key constraint.
         */
        const prev = await versionModel.findOne({
          where: {
            root: id,
            version: currentVersion,
          },
        });
        if (!prev) {
          throw new Error(
            `Could not find version ${currentVersion} of ${name} with id ${id}`
          );
        }
        if (!prev.isLatest) {
          throw new ConcurrentModificationError(
            `version ${prev.version} is not the latest version`
          );
        }
        const lookupData = await opts.lookupColumns.prepare(data, conn);

        // Create new version, update previous version's isLatest flag,
        // and update lookup tables

        return await conn.transaction(async (trx) => {
          // Make new version not the latest
          await versionModel.update({
            values: {
              isLatest: false,
            },
            where: {
              root: args.id,
              version: prev.version,
            },
            trx,
          });
          // Create new version
          const version = await versionModel
            .create(
              {
                root: id,
                version: prev.version + 1,
                modifiedBy: modifiedBy || undefined,
                isLatest: true,
                data: data,
              },
              {
                trx,
              }
            )
            .catch((err) => {
              if (err && err.name === 'SequelizeUniqueConstraintError') {
                throw new ConcurrentModificationError(
                  'New version already created'
                );
              } else {
                throw err;
              }
            });
          // Update lookup data
          await rootModel.update({
            values: lookupData as any,
            trx,
            where: {
              id: args.id,
            } as any,
          });
          return createInstance({ root: { id }, data, version });
        });
      },
    };

    return result;
  };
