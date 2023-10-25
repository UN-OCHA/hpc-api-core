/**
 * This file is a new (type-safe) interface for common authentication functions
 * ahead of the auth refactor outlined in HPC-6999
 */
import v4Models from '../db';
import { AuthTargetId } from '../db/models/authTarget';
import { ParticipantId } from '../db/models/participant';
import { InstanceOfModel } from '../db/util/types';
import { createBrandedValue } from '../util/types';
import * as crypto from 'crypto';
import { promisify } from 'util';
import type { Database } from '../db/type';
import { createDeferredFetcher } from '../db/util/deferred';
import { organizeObjectsByUniqueProperty } from '../util';
import { Context } from '../lib/context';
import { SharedLogContext } from '../lib/logging';
import * as hid from './hid';
import {
  AUTH_PERMISSIONS,
  GrantedPermissions,
  hasRequiredPermissions,
  PermissionStrings,
  RequiredPermissionsCondition,
} from './permissions';
import {
  calculatePermissionsFromRolesGrant,
  filterValidRoleStrings,
  RolesGrant,
} from './roles';
import { Op } from '../db/util/conditions';

const randomBytes = promisify(crypto.randomBytes);

type Models = ReturnType<typeof v4Models>;

type Participant = InstanceOfModel<Database['participant']>;
type AuthGrantee = InstanceOfModel<Database['authGrantee']>;
type AuthTarget = InstanceOfModel<Database['authTarget']>;
type AuthToken = InstanceOfModel<Database['authToken']>;

export type ProcessInviteFn = (args: {
  actor: ParticipantId;
  log: SharedLogContext;
  target: AuthTarget;
  grantee: AuthGrantee;
}) => Promise<void>;

export const P = AUTH_PERMISSIONS;

export const BASIC_AUTH_USER = 'hid';

const activateInvitesForEmail = async (
  participant: Participant,
  email: string,
  context: Context,
  processInvite?: ProcessInviteFn
) => {
  const { log, models } = context;
  const invites = await models.authInvite.find({
    where: { email },
  });

  // Activate any invitations
  if (invites.length > 0) {
    const grantee = await models.authGrantee.create({
      type: 'user',
      granteeId: participant.id,
    });

    const targets = new Map<AuthTargetId, AuthTarget>();
    for (const target of await models.authTarget.find({
      where: {
        id: {
          [Op.IN]: invites.map((i) => i.target),
        },
      },
    })) {
      targets.set(target.id, target);
    }

    for (const invite of invites) {
      const target = targets.get(invite.target);
      /* istanbul ignore if - should not be possible due to sequelize constraints */
      if (!target) {
        throw new Error(`Missing target with and ID ${invite.target}`);
      }
      await models.authGrant.create(
        {
          grantee: grantee.id,
          target: invite.target,
          roles: invite.roles,
        },
        invite.actor,
        invite.updatedAt
      );
      if (processInvite) {
        await processInvite({
          grantee,
          target,
          actor: invite.actor,
          log,
        });
      }
    }
    await models.authInvite.destroy({
      where: { email },
    });
  }
};

export const getLoggedInParticipant = async (
  context: Context,
  processInvite?: ProcessInviteFn
): Promise<Participant | undefined> => {
  const { models } = context;

  const tokenPromise = getParticipantFromToken(context);
  const hidPromise = hid
    .getHidInfo(context)
    .then((hidInfo) => ({ result: 'success' as const, hidInfo }))
    .catch((error) => ({ result: 'error' as const, error }));

  // Check if we have our own token before we check HID
  const tokenParticipant = await tokenPromise;
  if (tokenParticipant) {
    return tokenParticipant;
  }

  // We don't have our own token, check HID
  const hidInfoResult = await hidPromise;
  if (hidInfoResult.result === 'error') {
    throw hidInfoResult.error;
  }
  const { hidInfo } = hidInfoResult;
  if (!hidInfo?.sub) {
    return undefined;
  }

  let participant = await models.participant.findOne({
    where: { hidSub: hidInfo.sub },
  });

  if (!participant) {
    // Create a new participant for this HID account
    // and transfer over all invites
    participant = await models.participant.create({
      email: hidInfo.email,
      name: hidInfo.name,
      hidSub: hidInfo.sub,
    });

    await activateInvitesForEmail(
      participant,
      hidInfo.email,
      context,
      processInvite
    );
  }
  // If the users' email address has changed
  // Update the user's email and activate any invites
  else if (participant.email !== hidInfo.email) {
    participant = (
      await models.participant.update({
        values: { email: hidInfo.email },
        where: { hidSub: hidInfo.sub },
      })
    )[0];

    await activateInvitesForEmail(
      participant,
      hidInfo.email,
      context,
      processInvite
    );
  }

  return participant;
};

/**
 * Check whether the specified action is allowed to be performed by the
 * currently logged in user.
 */
export const actionIsPermitted = async <
  AdditionalGlobalPermissions extends string,
>(
  condition: RequiredPermissionsCondition<AdditionalGlobalPermissions>,
  context: Context
): Promise<boolean> => {
  if (condition === 'anyone') {
    return true;
  }

  if (condition === 'noone') {
    return false;
  }

  return hasRequiredPermissions(await calculatePermissions(context), condition);
};

/**
 * Validate the given target, and roles for the given target,
 * returning a RolesGrant instance if valid, and throwing an error if not.
 */
export const calculateRolesGrantFromTargetAndRoleStrings = (
  target: AuthTarget,
  roles: string[],
  logContext: SharedLogContext
): RolesGrant => {
  if (target.type === 'global') {
    return {
      type: 'global',
      roles: filterValidRoleStrings('global', roles, logContext),
    };
  } else if (target.targetId) {
    if (target.type === 'operation') {
      return {
        type: 'operation',
        id: target.targetId,
        roles: filterValidRoleStrings('operation', roles, logContext),
      };
    } else if (target.type === 'operationCluster') {
      return {
        type: 'operationCluster',
        id: target.targetId,
        roles: filterValidRoleStrings('operationCluster', roles, logContext),
      };
    } else if (target.type === 'plan') {
      return {
        type: 'plan',
        id: target.targetId,
        roles: filterValidRoleStrings('plan', roles, logContext),
      };
    } else if (target.type === 'project') {
      return {
        type: 'project',
        id: target.targetId,
        roles: filterValidRoleStrings('project', roles, logContext),
      };
    } else if (target.type === 'governingEntity') {
      return {
        type: 'governingEntity',
        id: target.targetId,
        roles: filterValidRoleStrings('governingEntity', roles, logContext),
      };
    }
  }
  throw new Error(`Invalid authTarget: ${target.type}:${target.targetId}`);
};

export const getRoleGrantsForUsers = async ({
  users,
  context,
}: {
  users: ParticipantId[];
  context: Context;
}): Promise<Map<ParticipantId, RolesGrant[]>> => {
  const { models, log } = context;

  // Get the grantees
  const grantees = await models.authGrantee.find({
    where: {
      type: 'user',
      granteeId: {
        [Op.IN]: users,
      },
    },
  });
  if (grantees.length === 0) {
    return new Map();
  }
  const granteesById = organizeObjectsByUniqueProperty(grantees, 'id');
  const grants = await models.authGrant.find({
    where: {
      grantee: {
        [Op.IN]: grantees.map((g) => g.id),
      },
    },
  });
  const targets = await models.authTarget.find({
    where: {
      id: {
        [Op.IN]: grants.map((g) => g.target),
      },
    },
  });
  const targetsById = organizeObjectsByUniqueProperty(targets, 'id');

  const result = new Map<ParticipantId, RolesGrant[]>();

  for (const grant of grants) {
    const grantee = granteesById.get(grant.grantee);
    if (!grantee) {
      throw new Error('Unexpected missing grantee');
    }

    const target = targetsById.get(grant.target);
    if (!target) {
      throw new Error('Unexpected missing target');
    }

    const participantId: ParticipantId = createBrandedValue(grantee.granteeId);
    let list = result.get(participantId);
    if (!list) {
      list = [];
      result.set(participantId, list);
    }
    list.push(
      calculateRolesGrantFromTargetAndRoleStrings(target, grant.roles, log)
    );
  }

  return result;
};

export const getRoleGrantsForUser = async ({
  user,
  context,
}: {
  user: ParticipantId;
  context: Context;
}): Promise<RolesGrant[]> =>
  (
    await getRoleGrantsForUsers({
      users: [user],
      context,
    })
  ).get(user) || [];

/**
 * Calculate the complete set of permissions for the logged in participant
 */
export const calculatePermissions = async <
  AdditionalGlobalPermissions extends string,
>(
  context: Context
): Promise<GrantedPermissions<AdditionalGlobalPermissions>> => {
  const participant = await getLoggedInParticipant(context);
  if (!participant) {
    return {};
  }

  const allowedFromGrants =
    await getAllowedPermissionsFromGrants<AdditionalGlobalPermissions>(
      participant.id,
      context,
      calculatePermissionsFromRolesGrant
    );

  return mergePermissionsFromGrants<AdditionalGlobalPermissions>(
    allowedFromGrants
  );
};

export const getAllowedPermissionsFromGrants = async <
  AdditionalGlobalPermissions extends string,
>(
  participantId: ParticipantId,
  context: Context,
  calculatePermissionsFn: typeof calculatePermissionsFromRolesGrant
): Promise<GrantedPermissions<AdditionalGlobalPermissions>[]> => {
  const { models } = context;

  const grants = await getRoleGrantsForUser({
    user: participantId,
    context,
  });
  const fetchers = {
    operationCluster: createDeferredFetcher(models.operationCluster),
    governingEntity: createDeferredFetcher(models.governingEntity),
  };

  // Calculate the allowed permissions for each of these grants
  return (await Promise.all(
    grants.map((grant) => calculatePermissionsFn(grant, fetchers))
  )) as GrantedPermissions<AdditionalGlobalPermissions>[];
};

export const mergePermissionsFromGrants = <
  AdditionalGlobalPermissions extends string,
>(
  allowedFromGrants: GrantedPermissions<AdditionalGlobalPermissions>[]
): GrantedPermissions<AdditionalGlobalPermissions> => {
  const allowed: GrantedPermissions<AdditionalGlobalPermissions> = {};

  const mergeAllowedPermissions = <
    Type extends keyof Omit<
      GrantedPermissions<AdditionalGlobalPermissions>,
      'global'
    >,
  >(
    type: Type,
    additions: Map<number, Set<PermissionStrings<Type>>>
  ) => {
    let existingMap = allowed[type] as
      | Map<number, Set<PermissionStrings<Type>>>
      | undefined;
    if (!existingMap) {
      existingMap = allowed[type] = new Map();
    }
    for (const [key, permissions] of additions.entries()) {
      let set = existingMap.get(key);
      if (!set) {
        existingMap.set(key, (set = new Set()));
      }
      for (const p of permissions) {
        set.add(p);
      }
    }
  };

  // Merge these granted permissions
  for (const granted of allowedFromGrants) {
    if (!granted) {
      continue;
    }
    if (granted.global) {
      allowed.global = allowed.global || new Set();
      for (const p of granted.global) {
        allowed.global.add(p);
      }
    }
    for (const [key, obj] of Object.entries(granted) as [
      keyof typeof granted,
      any,
    ][]) {
      if (key !== 'global') {
        mergeAllowedPermissions(key, obj);
      }
    }
  }

  return allowed;
};

/**
 * Check if the token is a custom HPC token that's stored in our database.
 */
export const getParticipantFromToken = async (
  context: Context
): Promise<Participant | null> => {
  const { models, token } = context;

  if (!token) {
    return null;
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest()
    .toString('hex');

  const proxy = await models.authToken.findOne({
    where: { tokenHash },
  });

  if (proxy && (!proxy.expires || proxy.expires.getTime() > Date.now())) {
    return models.participant.findOne({
      where: {
        id: proxy.participant,
      },
    });
  }

  return null;
};

/**
 * Create a new access token for the given user.
 */
export const createToken = async ({
  participant,
  expires,
  models,
}: {
  participant: ParticipantId;
  expires?: Date;
  models: Models;
}): Promise<{
  instance: AuthToken;
  token: string;
}> => {
  const token = (await randomBytes(48)).toString('hex');
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest()
    .toString('hex');
  return {
    instance: await models.authToken.create({
      tokenHash,
      participant,
      expires,
    }),
    token,
  };
};
