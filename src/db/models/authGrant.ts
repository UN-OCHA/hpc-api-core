import * as t from 'io-ts';
import Knex = require('knex');

import { defineSequelizeModel } from '../util/sequelize-model';
import type { InstanceOfModel, UserDataOfModel } from '../util/types';
import initAuthGrantLog from './authGrantLog';
import { AUTH_GRANTEE_ID } from './authGrantee';
import { AUTH_TARGET_ID } from './authTarget';
import type { ParticipantId } from './participant';

const authGrantModel = (conn: Knex) => {
  const authGrantLog = initAuthGrantLog(conn);

  const model = defineSequelizeModel({
    tableName: 'authGrant',
    fields: {
      required: {
        target: {
          kind: 'branded-integer',
          brand: AUTH_TARGET_ID,
        },
        grantee: {
          kind: 'branded-integer',
          brand: AUTH_GRANTEE_ID,
        },
        roles: {
          kind: 'checked',
          type: t.array(t.string),
        },
      },
    },
    softDeletionEnabled: false,
  })(conn);

  type UserData = UserDataOfModel<typeof model>;
  type Instance = InstanceOfModel<typeof model>;

  // Rather than exposing authGrant db operations directly,
  // expose wrappers that require that a user is specified,
  // and transactionally create logs

  const create = (
    data: UserData,
    actor: ParticipantId,
    date = new Date(),
    trx?: Knex.Transaction<any, any>
  ): Promise<Instance> => {
    const createCallback = async (trx: Knex.Transaction<any, any>) => {
      await authGrantLog.create(
        {
          grantee: data.grantee,
          newRoles: data.roles,
          date,
          target: data.target,
          actor,
        },
        {
          trx,
        }
      );
      return await model.create(data, { trx });
    };

    return trx ? createCallback(trx) : conn.transaction(createCallback);
  };

  const update = (
    data: UserData,
    actor: ParticipantId,
    trx?: Knex.Transaction<any, any>
  ): Promise<void> => {
    const updateCallback = async (trx: Knex.Transaction<any, any>) => {
      await authGrantLog.create(
        {
          grantee: data.grantee,
          newRoles: data.roles,
          date: new Date(),
          target: data.target,
          actor,
        },
        {
          trx,
        }
      );
      if (data.roles.length === 0) {
        await model.destroy({
          where: {
            grantee: data.grantee,
            target: data.target,
          },
          trx,
        });
      } else {
        await model.update({
          where: {
            grantee: data.grantee,
            target: data.target,
          },
          trx,
          values: {
            roles: data.roles,
          },
        });
      }
    };

    return trx ? updateCallback(trx) : conn.transaction(updateCallback);
  };

  const createOrUpdate = async (
    data: UserData,
    actor: ParticipantId
  ): Promise<void> => {
    const existing = await model.findOne({
      where: {
        grantee: data.grantee,
        target: data.target,
      },
    });
    if (existing) {
      await update(data, actor);
    } else {
      await create(data, actor);
    }
  };

  return {
    _internals: model._internals,
    find: model.find,
    findOne: model.findOne,
    create,
    update,
    createOrUpdate,
  };
};

export default authGrantModel;
