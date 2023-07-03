/**
 * A mapping from target types to permissions that can apply to those targets
 */
export const AUTH_PERMISSIONS = {
  global: {
    RUN_ADMIN_COMMANDS: 'canRunAdminCommands',
    MODIFY_ACCESS_AND_PERMISSIONS: 'canModifyAccessAndPermissions',
    /**
     * Can modify the access and permissions of operations,
     * or any object nested underneath an operation
     * (like an operation cluster).
     */
    MODIFY_OPERATION_ACCESS_AND_PERMISSIONS:
      'canModifyOperationAccessAndPermissions',
    ADD_OPERATION: 'canAddOperation',
    /**
     * Can view ALL the data for operations or any nested information
     *
     * (equivalent to operation.VIEW_DATA for every operation)
     */
    VIEW_ANY_OPERATION_DATA: 'viewOperationData',
    /**
     * Can list operations and view the metadata for any operation
     *
     * (equivalent to operation.VIEW_METADATA for every operation)
     */
    VIEW_ANY_OPERATION_METADATA: 'viewOperationMetadata',
    /**
     * Can list operations and view the metadata for assigned operations
     *
     * This permission is expected to be present whenever a user has the
     * `VIEW_METADATA` permission for an operation
     */
    VIEW_ASSIGNED_OPERATION_METADATA: 'viewPermittedOperationMetadata',
    CREATE_ORGANIZATIONS: 'canCreateOrganizations',
    /**
     * Can edit the raw data of any assignment that is a form
     */
    EDIT_ANY_FORM_ASSIGNMENT_RAW_DATA: 'editFormAssignmentRawData',
    /**
     * Can edit the clean data of any assignment that is a form
     */
    EDIT_ANY_FORM_ASSIGNMENT_CLEAN_DATA: 'editFormAssignmentCleanData',
    /**
     * Can edit assignments when their are associated with a closed reporting
     * window.
     *
     * (This does not allow for edit access for any assignment, that must be
     * granted separately)
     */
    EDIT_ASSIGNMENTS_WHEN_REPORTING_WINDOW_CLOSED:
      'editAssignmentsWhenReportingWindowClosed',
    /**
     * Can edit assignments when their are associated with a pending reporting
     * window.
     *
     * (This does not allow for edit access for any assignment, that must be
     * granted separately)
     */
    EDIT_ASSIGNMENTS_WHEN_REPORTING_WINDOW_PENDING:
      'editAssignmentsWhenReportingWindowPending',
    /**
     * Can view the data associated with any plan
     */
    VIEW_ANY_PLAN_DATA: 'viewAnyPlanData',
    /**
     * Can edit the data associated with any plan (when that plan is editable)
     */
    EDIT_ANY_PLAN_DATA: 'editAnyPlanData',
    /**
     * Can edit any project
     */
    EDIT_ANY_PROJECT: 'editAnyProject',
    VIEW_ANY_FLOW: 'viewAnyFlow',
    EDIT_ANY_FLOW: 'editAnyFlow',
    VIEW_CATEGORIES: 'viewCategories',
    EDIT_CATEGORIES: 'editCategories',
    VIEW_ALL_JOBS: 'viewAllJobs',
    /**
     * Can move projects associated with any plan to any step of the workflow.
     */
    PROJECT_WORKFLOW_MOVE_TO_ANY_STEP: 'projectWorkflowMoveToAnyStep',
    /**
     * Can clone data from any project to a new project
     */
    CLONE_ANY_PROJECT: 'cloneAnyProject',
    DELETE_ANY_PROJECT: 'canDeleteAnyProject',
    /**
     * Can change visibility of any plan in Projects Module
     */
    CHANGE_ANY_PLAN_VISIBILITY_IN_PROJECTS:
      'canChangeAnyPlanVisiblityInProjects',
  },
  operation: {
    /**
     * Can view ALL the data for the operation and underlying clusters
     */
    VIEW_DATA: 'canViewData',
    /**
     * Can view the high-level metadata for the operation (e.g. name),
     * but no underlying objects (e.g. clusters)
     */
    VIEW_METADATA: 'canViewMetadata',
    /**
     * Can view the high-level metadata for any of the clusters under this op
     */
    VIEW_CLUSTER_METADATA: 'canViewClusterMetadata',
    /**
     * Can modify the access and permissions of any of its clusters
     */
    MODIFY_CLUSTER_ACCESS_AND_PERMISSIONS:
      'canModifyClusterAccessAndPermissions',
    CREATE_CLUSTER: 'createCluster',
    /**
     * This also applies to any assignment for any object nested under this
     * operation
     */
    VIEW_ASSIGNMENT_DATA: 'viewAssignmentData',
    /**
     * This also applies to any assignment for any object nested under this
     * operation
     */
    EDIT_ASSIGNMENT_RAW_DATA: 'editAssignmentRawData',
    /**
     * This also applies to any assignment for any object nested under this
     * operation
     */
    EDIT_ASSIGNMENT_CLEAN_DATA: 'editAssignmentCleanData',
  },
  operationCluster: {
    /**
     * Can view ALL the data for this cluster and nested objects
     */
    VIEW_DATA: 'canViewData',
    /**
     * Can view the high-level metadata for the operation cluster (e.g. name),
     * but no underlying objects
     */
    VIEW_METADATA: 'canViewMetadata',
    VIEW_ASSIGNMENT_DATA: 'viewAssignmentData',
    EDIT_ASSIGNMENT_RAW_DATA: 'editAssignmentRawData',
    EDIT_ASSIGNMENT_CLEAN_DATA: 'editAssignmentCleanData',
  },
  plan: {
    /**
     * Can move projects associated with this plan to any step of the workflow.
     */
    PROJECT_WORKFLOW_MOVE_TO_ANY_STEP: 'projectWorkflowMoveToAnyStep',
    /**
     * Can view the data associated with the plan
     */
    VIEW_DATA: 'viewPlanData',
    /**
     * Can edit the data associated with the plan (when that plan is editable)
     */
    EDIT_DATA: 'editPlanData',
    /**
     * Can edit access and permissions of all projects for a given plan.
     */
    MODIFY_ACCESS_AND_PERMISSIONS_OF_PROJECTS:
      'canModifyAccessAndPermissionsOfProjects',
    /**
     * Can edit any project under this plan
     */
    EDIT_PROJECTS: 'editProjects',
    /**
     * Can delete any project under this plan
     */
    DELETE_PROJECTS: 'deleteProjects',
    /**
     * Can clone any project under this plan
     */
    CLONE_PROJECTS: 'cloneProjects',
    /**
     * Can make plan visible to projects, in Projects Module
     */
    MAKE_VISIBLE_IN_PROJECTS: 'canMakeVisibleInProjects',
  },
  project: {
    MODIFY_ACCESS_AND_PERMISSIONS: 'canModifyAccessAndPermissions',
    /**
     * Can view the data associated with the project
     */
    VIEW_DATA: 'viewProjectData',
    EDIT: 'canEdit',
    /**
     * Can clone data from the project to a new project
     */
    CLONE: 'clone',
    DELETE: 'canDelete',
  },
  governingEntity: {
    /**
     * Can edit the data associated with the governing Entity
     * (when it's associated plan is editable)
     */
    EDIT_DATA: 'editGoverningEntityData',
    /**
     * Can edit the project data associated with the governing entity
     */
    EDIT_PROJECTS: 'editProjects',
    /**
     * Can move projects associated with this cluster to any step of the workflow.
     */
    PROJECT_WORKFLOW_MOVE_IF_PLAN_UNLOCKED: 'projectWorkflowMoveIfPlanUnlocked',
  },
} as const;

/**
 * Get the union type of string permissions allowed for a particular target type
 */
export type PermissionStrings<K extends keyof typeof AUTH_PERMISSIONS> =
  (typeof AUTH_PERMISSIONS)[K][keyof (typeof AUTH_PERMISSIONS)[K]];

/**
 * Type that represents an object containing the complete computed permissions
 * for a particular user or actor.
 */
export type GrantedPermissions<AdditionalGlobalPermissions extends string> = {
  -readonly [key in keyof Partial<
    Omit<typeof AUTH_PERMISSIONS, 'global'>
  >]: Map<number, Set<PermissionStrings<key>>>;
} & {
  global?: Set<PermissionStrings<'global'> | AdditionalGlobalPermissions>;
};

/**
 * A type that represents a requirement for a permission to be granted for a
 * particular action to take place.
 */
export type RequiredPermission<AdditionalGlobalPermissions extends string> =
  | {
      type: 'global';
      /**
       * TODO: move all global roles / permissions to new authentication system
       */
      permission: PermissionStrings<'global'> | AdditionalGlobalPermissions;
    }
  | {
      type: 'operation';
      permission: PermissionStrings<'operation'>;
      id: number;
    }
  | {
      type: 'operationCluster';
      permission: PermissionStrings<'operationCluster'>;
      id: number;
    }
  | {
      type: 'plan';
      permission: PermissionStrings<'plan'>;
      id: number;
    }
  | {
      type: 'project';
      permission: PermissionStrings<'project'>;
      id: number;
    }
  | {
      type: 'governingEntity';
      permission: PermissionStrings<'governingEntity'>;
      id: number;
    };

/**
 * A list of permissions that must all be granted for an access to be permitted
 */
type RequiredPermissionsConjunctionAnd<
  AdditionalGlobalPermissions extends string
> = {
  and: RequiredPermissionsCondition<AdditionalGlobalPermissions>[];
};

export type RequiredPermissionsConjunction<
  AdditionalGlobalPermissions extends string
> =
  | RequiredPermissionsConjunctionAnd<AdditionalGlobalPermissions>
  | RequiredPermission<AdditionalGlobalPermissions>;

export const isAnd = <AdditionalGlobalPermissions extends string>(
  conj: RequiredPermissionsCondition<AdditionalGlobalPermissions>
): conj is RequiredPermissionsConjunctionAnd<AdditionalGlobalPermissions> =>
  !!(conj as RequiredPermissionsConjunctionAnd<AdditionalGlobalPermissions>)
    .and;

/**
 * A condition expressing the permissions required for an action in
 * Disjunctive Normal Form (https://en.wikipedia.org/wiki/Disjunctive_normal_form)
 */
export type RequiredPermissionsConditionOr<
  AdditionalGlobalPermissions extends string
> = {
  or: RequiredPermissionsCondition<AdditionalGlobalPermissions>[];
};

export type RequiredPermissionsCondition<
  AdditionalGlobalPermissions extends string
> =
  | RequiredPermissionsConditionOr<AdditionalGlobalPermissions>
  | RequiredPermissionsConjunction<AdditionalGlobalPermissions>
  | 'anyone'
  | 'noone';

export const isOr = <AdditionalGlobalPermissions extends string>(
  conj: RequiredPermissionsCondition<AdditionalGlobalPermissions>
): conj is RequiredPermissionsConditionOr<AdditionalGlobalPermissions> =>
  !!(conj as RequiredPermissionsConditionOr<AdditionalGlobalPermissions>).or;

export const hasRequiredPermissions = <
  AdditionalGlobalPermissions extends string
>(
  granted: GrantedPermissions<AdditionalGlobalPermissions>,
  condition: RequiredPermissionsCondition<AdditionalGlobalPermissions>
): boolean => {
  const isAllowed = (
    permission: RequiredPermission<AdditionalGlobalPermissions>
  ): boolean => {
    if (permission.type === 'global') {
      return !!granted.global?.has(permission.permission);
    }
    const map = granted[permission.type];
    const set: Set<string> | undefined = map?.get(permission.id);
    return !!set?.has(permission.permission);
  };

  const checkCondition = (
    cond: RequiredPermissionsCondition<AdditionalGlobalPermissions>
  ): boolean => {
    if (cond === 'anyone') {
      return true;
    } else if (cond === 'noone') {
      return false;
    } else if (isOr(cond)) {
      for (const conjunction of cond.or) {
        if (checkCondition(conjunction)) {
          return true;
        }
      }
      return false;
    } else if (isAnd(cond)) {
      for (const p of cond.and) {
        if (!checkCondition(p)) {
          return false;
        }
      }
      return true;
    }
    return isAllowed(cond);
  };

  return checkCondition(condition);
};
