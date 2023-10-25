import type { Database } from '../db/type';
import type { DeferredFetcherForModel } from '../db/util/deferred';
import { type SharedLogContext } from '../lib/logging';
import { getOrCreate } from '../util';
import { createBrandedValue } from '../util/types';
import { AUTH_PERMISSIONS as P, type GrantedPermissions } from './permissions';

/**
 * A breakdown of the different types of roles are available
 * for different target types.
 */
export const AUTH_ROLES = {
  global: {
    HPC_ADMIN: 'hpc_admin',
    RPM_ADMIN: 'rpmAdmin',
    FTS_ADMIN: 'ftsAdmin',
    PROJECTS_ADMIN: 'projectsAdmin',
    OMNISCIENT: 'omniscient',
    SWAPS: 'swaps',
  },
  operation: {
    OPERATION_LEAD: 'operationLead',
    READ_ONLY: 'readonly',
  },
  operationCluster: {
    CLUSTER_LEAD: 'clusterLead',
  },
  plan: {
    PLAN_LEAD: 'planLead',
    READ_ONLY: 'readonly',
  },
  project: {
    PROJECT_OWNER: 'projectOwner',
  },
  governingEntity: {
    CLUSTER_LEAD: 'clusterLead',
  },
} as const;

export type RoleAuthTargetString = keyof typeof AUTH_ROLES;

/**
 * Get the union type of string permissions allowed for a particular target type
 */
export type RolesStrings<K extends RoleAuthTargetString> =
  (typeof AUTH_ROLES)[K][keyof (typeof AUTH_ROLES)[K]] & string;

export const getValidRolesForTargetType = <K extends RoleAuthTargetString>(
  targetType: K
): Array<RolesStrings<K>> =>
  Object.values(AUTH_ROLES[targetType]) as Array<RolesStrings<K>>;

export const isValidRoleString = <K extends RoleAuthTargetString>(
  targetType: K,
  role: string
): role is RolesStrings<K> => {
  const validRoles = new Set<string>(Object.values(AUTH_ROLES[targetType]));
  if (!validRoles.has(role)) {
    return false;
  }
  return true;
};

export const isValidRoleStringsArray = <K extends RoleAuthTargetString>(
  targetType: K,
  roles: string[]
): roles is Array<RolesStrings<K>> => {
  for (const r of roles) {
    const validRoles = new Set<string>(Object.values(AUTH_ROLES[targetType]));
    if (!validRoles.has(r)) {
      return false;
    }
  }
  return true;
};

/**
 * Filter out any invalid roles for the given type,
 * and report an error if an invalid role is found
 */
export const filterValidRoleStrings = <K extends RoleAuthTargetString>(
  targetType: K,
  roles: string[],
  logContext: SharedLogContext
): Array<RolesStrings<K>> => {
  const valid = (role: string): role is RolesStrings<K> =>
    isValidRoleString(targetType, role);
  const validRoles = roles.filter(valid);
  if (roles.length !== validRoles.length) {
    const invalid = roles.filter(
      (role) => !isValidRoleString(targetType, role)
    );
    const error = new Error(
      `Invalid roles found for user: ${invalid.join(', ')}`
    );
    logContext.error(error.message, {
      error,
    });
  }
  return validRoles;
};

/**
 * A type that represents granted roles for a particular target
 */
export type RolesGrant =
  | {
      type: 'global';
      roles: Array<RolesStrings<'global'>>;
    }
  | {
      type: 'operation';
      roles: Array<RolesStrings<'operation'>>;
      id: number;
    }
  | {
      type: 'operationCluster';
      roles: Array<RolesStrings<'operationCluster'>>;
      id: number;
    }
  | {
      type: 'plan';
      roles: Array<RolesStrings<'plan'>>;
      id: number;
    }
  | {
      type: 'project';
      roles: Array<RolesStrings<'project'>>;
      id: number;
    }
  | {
      type: 'governingEntity';
      roles: Array<RolesStrings<'governingEntity'>>;
      id: number;
    };

/**
 * Create a function that checks whether a given RolesGrant is for a specific
 * target type and role
 */
export const getGrantValidator =
  <K extends RoleAuthTargetString>(type: K, role: RolesStrings<K>) =>
  (grant: RolesGrant): grant is RolesGrant & { type: K } =>
    grant.type === type &&
    (grant.roles as Array<RolesStrings<K>>).includes(role);

/**
 * Calculate the effective permissions that are granted to a user based on a
 * list of grants for a particular target;
 *
 * This is implemented as a function (rather than being based purely on data)
 * as there are sometimes intricate behaviours / cascading permissions we want
 * to implement (such as cluster leads having read access to their operations).
 */
export const calculatePermissionsFromRolesGrant = async <
  AdditionalGlobalPermissions extends string,
>(
  grant: RolesGrant,
  fetchers: {
    governingEntity: DeferredFetcherForModel<Database['governingEntity']>;
    operationCluster: DeferredFetcherForModel<Database['operationCluster']>;
  },
  /**
   * Additional permissions that should be added to the global target
   */
  additionalGlobalPermissions?: Set<AdditionalGlobalPermissions>
): Promise<GrantedPermissions<AdditionalGlobalPermissions>> => {
  const granted: GrantedPermissions<AdditionalGlobalPermissions> = {};
  if (grant.type === 'global') {
    const global = (granted.global = granted.global || new Set());
    for (const role of grant.roles) {
      if (role === 'hpc_admin') {
        // All new Permissions
        for (const perm of Object.values(P.global)) {
          global.add(perm);
        }
      } else if (role === 'rpmAdmin') {
        // New Permissions
        global.add(P.global.VIEW_ANY_PLAN_DATA);
        global.add(P.global.EDIT_ANY_PLAN_DATA);
        global.add(P.global.EDIT_ANY_MEASUREMENT);
        global.add(P.global.CHANGE_ANY_PLAN_VISIBILITY_IN_PROJECTS);
      } else if (role === 'ftsAdmin') {
        // New Permissions
        global.add(P.global.VIEW_ANY_FLOW);
        global.add(P.global.EDIT_ANY_FLOW);
        global.add(P.global.EDIT_CATEGORIES);
        global.add(P.global.VIEW_CATEGORIES);
      } else if (role === 'projectsAdmin') {
        // New Permissions
        global.add(P.global.PROJECT_WORKFLOW_MOVE_TO_ANY_STEP);
      } else if (role === 'swaps') {
        global.add(P.global.MODIFY_OPERATION_ACCESS_AND_PERMISSIONS);
        global.add(P.global.ADD_OPERATION);
        global.add(P.global.VIEW_ANY_OPERATION_DATA);
        global.add(P.global.VIEW_ANY_OPERATION_METADATA);
        global.add(P.global.EDIT_ANY_FORM_ASSIGNMENT_CLEAN_DATA);
        global.add(P.global.EDIT_ANY_FORM_ASSIGNMENT_RAW_DATA);
        global.add(P.global.EDIT_ASSIGNMENTS_WHEN_REPORTING_WINDOW_CLOSED);
        global.add(P.global.EDIT_ASSIGNMENTS_WHEN_REPORTING_WINDOW_PENDING);
      }
    }
  } else if (grant.type === 'operation') {
    const global = (granted.global = granted.global || new Set());
    if (!granted.operation) {
      granted.operation = new Map();
    }
    let operationSet = granted.operation.get(grant.id);
    if (!operationSet) {
      granted.operation.set(grant.id, (operationSet = new Set()));
    }
    for (const role of grant.roles) {
      if (role === 'operationLead') {
        global.add(P.global.VIEW_ASSIGNED_OPERATION_METADATA);
        global.add(P.global.CREATE_ORGANIZATIONS);
        operationSet.add(P.operation.CREATE_CLUSTER);
        operationSet.add(P.operation.EDIT_ASSIGNMENT_RAW_DATA);
        operationSet.add(P.operation.MODIFY_CLUSTER_ACCESS_AND_PERMISSIONS);
        operationSet.add(P.operation.VIEW_ASSIGNMENT_DATA);
        operationSet.add(P.operation.VIEW_CLUSTER_METADATA);
        operationSet.add(P.operation.VIEW_DATA);
        operationSet.add(P.operation.VIEW_METADATA);
      } else if (role === 'readonly') {
        global.add(P.global.VIEW_ASSIGNED_OPERATION_METADATA);
        operationSet.add(P.operation.VIEW_ASSIGNMENT_DATA);
        operationSet.add(P.operation.VIEW_CLUSTER_METADATA);
        operationSet.add(P.operation.VIEW_DATA);
        operationSet.add(P.operation.VIEW_METADATA);
      }
    }
  } else if (grant.type === 'operationCluster') {
    const cluster = await fetchers.operationCluster.get(
      createBrandedValue(grant.id)
    );
    if (cluster) {
      const global = (granted.global = granted.global || new Set());
      if (!granted.operation) {
        granted.operation = new Map();
      }
      let operationSet = granted.operation.get(cluster.data.operation);
      if (!operationSet) {
        granted.operation.set(
          cluster.data.operation,
          (operationSet = new Set())
        );
      }
      if (!granted.operationCluster) {
        granted.operationCluster = new Map();
      }
      let clusterSet = granted.operationCluster.get(cluster.id);
      if (!clusterSet) {
        granted.operationCluster.set(cluster.id, (clusterSet = new Set()));
      }
      for (const role of grant.roles) {
        if (role === 'clusterLead') {
          global.add(P.global.VIEW_ASSIGNED_OPERATION_METADATA);
          operationSet.add(P.operation.VIEW_CLUSTER_METADATA);
          operationSet.add(P.operation.VIEW_METADATA);
          clusterSet.add(P.operationCluster.VIEW_METADATA);
          clusterSet.add(P.operationCluster.VIEW_DATA);
          clusterSet.add(P.operationCluster.VIEW_ASSIGNMENT_DATA);
          clusterSet.add(P.operationCluster.EDIT_ASSIGNMENT_RAW_DATA);
        }
      }
    }
  } else if (grant.type === 'plan') {
    if (!granted.plan) {
      granted.plan = new Map();
    }
    let planSet = granted.plan.get(grant.id);
    if (!planSet) {
      granted.plan.set(grant.id, (planSet = new Set()));
    }
    for (const role of grant.roles) {
      if (role === 'planLead') {
        planSet.add(P.plan.PROJECT_WORKFLOW_MOVE_TO_ANY_STEP);
        planSet.add(P.plan.VIEW_DATA);
        planSet.add(P.plan.EDIT_DATA);
        planSet.add(P.plan.EDIT_MEASUREMENTS);
        planSet.add(P.plan.MODIFY_ACCESS_AND_PERMISSIONS_OF_PROJECTS);
        planSet.add(P.plan.EDIT_PROJECTS);
        planSet.add(P.plan.DELETE_PROJECTS);
        planSet.add(P.plan.CLONE_PROJECTS);
        planSet.add(P.plan.MAKE_VISIBLE_IN_PROJECTS);
      }
    }
  } else if (grant.type === 'project') {
    if (!granted.project) {
      granted.project = new Map();
    }
    let projectSet = granted.project.get(grant.id);
    if (!projectSet) {
      granted.project.set(grant.id, (projectSet = new Set()));
    }
    for (const role of grant.roles) {
      if (role === 'projectOwner') {
        projectSet.add(P.project.EDIT);
        projectSet.add(P.project.CLONE);
        projectSet.add(P.project.DELETE);
        projectSet.add(P.project.MODIFY_ACCESS_AND_PERMISSIONS);
        projectSet.add(P.project.VIEW_DATA);
      }
    }
  } else if (grant.type === 'governingEntity') {
    if (!granted.governingEntity) {
      granted.governingEntity = new Map();
    }
    let geSet = granted.governingEntity.get(grant.id);
    if (!geSet) {
      granted.governingEntity.set(grant.id, (geSet = new Set()));
    }

    const governingEntity = await fetchers.governingEntity.get(
      createBrandedValue(grant.id)
    );

    if (!governingEntity) {
      throw new Error(`Cannot find governing entity with ID ${grant.id}`);
    }

    if (!granted.plan) {
      granted.plan = new Map();
    }

    const planSet = getOrCreate(
      granted.plan,
      governingEntity.planId,
      () => new Set()
    );

    for (const role of grant.roles) {
      if (role === 'clusterLead') {
        geSet.add(P.governingEntity.EDIT_DATA);
        geSet.add(P.governingEntity.EDIT_PROJECTS);
        geSet.add(P.governingEntity.EDIT_MEASUREMENTS);
        geSet.add(P.governingEntity.PROJECT_WORKFLOW_MOVE_IF_PLAN_UNLOCKED);
        geSet.add(P.governingEntity.MODIFY_ACCESS_AND_PERMISSIONS_OF_PROJECTS);
        planSet.add(P.plan.VIEW_DATA);
      }
    }
  }

  // Add additional global permissions
  if (additionalGlobalPermissions) {
    const global = (granted.global = granted.global || new Set());
    for (const permission of additionalGlobalPermissions) {
      global.add(permission);
    }
  }

  if (granted.global?.size === 0) {
    delete granted.global;
  }

  return granted;
};
