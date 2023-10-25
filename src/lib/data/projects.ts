import { GoverningEntityId } from '../../db/models/governingEntity';
import { OrganizationId } from '../../db/models/organization';
import { findAndOrganizeObjectsByUniqueProperty } from '../../db/fetching';
import { PlanId } from '../../db/models/plan';
import { ProjectId } from '../../db/models/project';
import { Database } from '../../db/type';
import { InstanceOfModel } from '../../db/util/types';
import { getRequiredData, groupObjectsByProperty } from '../../util';
import { Op } from '../../db/util/conditions';
import { GlobalClusterId } from '../../db/models/globalCluster';
import { createBrandedValue } from '../../util/types';
import { SharedLogContext } from '../logging';
import isEqual = require('lodash/isEqual');

/**
 * The `name` value used across all budget segments that are segmented by
 * organization and cluster
 */
const BUDGET_SEGMENTATION_BY_ORG = 'segmentation by organization';

export interface ProjectData {
  project: InstanceOfModel<Database['project']>;
  projectVersion: InstanceOfModel<Database['projectVersion']>;
  projectVersionPlan: InstanceOfModel<Database['projectVersionPlan']>;
  workflowStatus: InstanceOfModel<Database['workflowStatusOption']> | null;
}

export async function getAllProjectsForPlan({
  database,
  planId,
  version,
}: {
  database: Database;
  planId: PlanId;
  version: 'latest' | 'current';
}): Promise<Map<ProjectId, ProjectData>> {
  const pvpsByProjectVersionId = await findAndOrganizeObjectsByUniqueProperty(
    database.projectVersionPlan,
    (t) =>
      t.find({
        where: {
          planId,
        },
      }),
    'projectVersionId'
  );
  const pvps = [...pvpsByProjectVersionId.values()];
  const pvsById = await findAndOrganizeObjectsByUniqueProperty(
    database.projectVersion,
    (t) =>
      t.find({
        where: {
          id: {
            [Op.IN]: new Set(pvps.map((pvp) => pvp.projectVersionId)),
          },
        },
      }),
    'id'
  );
  const projectVersions = [...pvsById.values()];
  const projects = await database.project.find({
    where: {
      id: {
        [Op.IN]: new Set(projectVersions.map((pv) => pv.projectId)),
      },
    },
  });
  const workflowStatusById = await findAndOrganizeObjectsByUniqueProperty(
    database.workflowStatusOption,
    (t) =>
      t.find({
        where: {
          id: {
            [Op.IN]: [
              ...new Set(pvps.map((pvp) => pvp.workflowStatusOptionId)),
            ],
          },
        },
      }),
    'id'
  );

  const result = new Map<ProjectId, ProjectData>();
  for (const project of projects) {
    let projectVersion: InstanceOfModel<Database['projectVersion']> | undefined;

    if (version === 'latest' && project.latestVersionId) {
      projectVersion = pvsById.get(project.latestVersionId);
    } else if (version === 'current' && project.currentPublishedVersionId) {
      projectVersion = pvsById.get(project.currentPublishedVersionId);
    } else {
      // Project only has ID and no base data yet, ignore
      continue;
    }

    if (!projectVersion) {
      // Project likely has older version assigned to plan but not current
      // version, okay to ignore
      continue;
    }
    // Sanity check that the project version is actually associated with
    // this project
    if (projectVersion.projectId !== project.id) {
      throw new Error(`Data inconsistency found for project ${project.id}`);
    }
    const pvp = getRequiredData(pvpsByProjectVersionId, projectVersion, 'id');
    const workflowStatus =
      (pvp.workflowStatusOptionId &&
        workflowStatusById.get(pvp.workflowStatusOptionId)) ||
      null;
    result.set(project.id, {
      project,
      projectVersion,
      projectVersionPlan: pvp,
      workflowStatus,
    });
  }

  return result;
}

export async function getOrganizationIDsForProjects<
  Data extends {
    projectVersion: Pick<ProjectData['projectVersion'], 'id'>;
  },
>({
  database,
  projects,
}: {
  database: Database;
  projects: Map<ProjectId, Data>;
}): Promise<Map<ProjectId, Set<OrganizationId>>> {
  const projectVersionIds = [...projects.values()].map(
    (p) => p.projectVersion.id
  );

  const groupedPVOs = groupObjectsByProperty(
    await database.projectVersionOrganization.find({
      where: {
        projectVersionId: {
          [Op.IN]: projectVersionIds,
        },
      },
    }),
    'projectVersionId'
  );

  const result = new Map<ProjectId, Set<OrganizationId>>();

  for (const [projectId, projectData] of projects) {
    const projectVersionId = projectData.projectVersion.id;
    const pvos = groupedPVOs.get(projectVersionId) || [];
    const organizationIds = new Set([...pvos].map((o) => o.organizationId));
    result.set(projectId, organizationIds);
  }

  return result;
}

export async function getGoverningEntityIDsForProjects<
  Data extends {
    projectVersion: Pick<ProjectData['projectVersion'], 'id'>;
  },
>({
  database,
  projects,
}: {
  database: Database;
  projects: Map<ProjectId, Data>;
}): Promise<Map<ProjectId, Set<GoverningEntityId>>> {
  const projectVersionIds = [...projects.values()].map(
    (p) => p.projectVersion.id
  );

  const groupedPVGEs = groupObjectsByProperty(
    await database.projectVersionGoverningEntity.find({
      where: {
        projectVersionId: {
          [Op.IN]: projectVersionIds,
        },
      },
    }),
    'projectVersionId'
  );

  const result = new Map<ProjectId, Set<GoverningEntityId>>();

  for (const [projectId, projectData] of projects) {
    const projectVersionId = projectData.projectVersion.id;
    const pvges = groupedPVGEs.get(projectVersionId) || [];
    const governingEntityIds = new Set(
      [...pvges].map((pvge) => pvge.governingEntityId)
    );
    result.set(projectId, governingEntityIds);
  }

  return result;
}

export const getConditionFieldsForProjects = async <
  Data extends {
    projectVersionPlan: Pick<ProjectData['projectVersionPlan'], 'id'>;
  },
>({
  database,
  projects,
}: {
  database: Database;
  projects: Map<ProjectId, Data>;
}): Promise<
  Map<ProjectId, Set<InstanceOfModel<Database['projectVersionField']>>>
> => {
  const projectVersionPlanIds = [...projects.values()].map(
    (v) => v.projectVersionPlan.id
  );

  const groupedConditionFields = groupObjectsByProperty(
    await database.projectVersionField.find({
      where: {
        projectVersionPlanId: {
          [Op.IN]: projectVersionPlanIds,
        },
      },
    }),
    'projectVersionPlanId'
  );

  const result = new Map<
    ProjectId,
    Set<InstanceOfModel<Database['projectVersionField']>>
  >();

  for (const [projectId, projectData] of projects) {
    const projectVersionPlanId = projectData.projectVersionPlan.id;
    const conditionFields = groupedConditionFields.get(projectVersionPlanId);
    result.set(projectId, conditionFields || new Set());
  }

  return result;
};

export interface ProjectBudgetSegmentBreakdown {
  organization: OrganizationId;
  globalCluster: GlobalClusterId;
  governingEntity: GoverningEntityId;
  amountUSD: number;
}

export const getProjectBudgetsByOrgAndCluster = async <
  Data extends {
    projectVersion: Pick<
      ProjectData['projectVersion'],
      'id' | 'currentRequestedFunds'
    >;
  },
>({
  database,
  projects,
  log,
  ignoreInconsistentBudgets,
}: {
  database: Database;
  projects: Map<ProjectId, Data>;
  log: SharedLogContext;
  /**
   * When true, projects with inconsistent budget data will be ignored, rather
   * than causing an error.
   *
   * This is necessary for example when reading the "latest" data for a set of
   * projects, which may be in draft or incomplete states.
   *
   * This should NOT be enabled when reading "current" (i.e. published) data,
   * to for example calculate a plan's overall requirements.
   */
  ignoreInconsistentBudgets?: true;
}): Promise<Map<ProjectId, Array<ProjectBudgetSegmentBreakdown>>> => {
  const projectVersionIds = [...projects.values()].map(
    (p) => p.projectVersion.id
  );

  const segments = await database.budgetSegment.find({
    where: {
      projectVersionId: {
        [Op.IN]: projectVersionIds,
      },
      name: BUDGET_SEGMENTATION_BY_ORG,
    },
  });

  const segmentsByProjectVersion = groupObjectsByProperty(
    segments,
    'projectVersionId'
  );

  const breakdowns = await database.budgetSegmentBreakdown.find({
    where: {
      budgetSegmentId: {
        [Op.IN]: segments.map((s) => s.id),
      },
    },
  });

  const breakdownsBySegment = groupObjectsByProperty(
    breakdowns,
    'budgetSegmentId'
  );

  const entities = await database.budgetSegmentBreakdownEntity.find({
    where: {
      budgetSegmentBreakdownId: {
        [Op.IN]: breakdowns.map((b) => b.id),
      },
    },
  });

  const entitiesByBreakdown = groupObjectsByProperty(
    entities,
    'budgetSegmentBreakdownId'
  );

  const result = new Map<ProjectId, Array<ProjectBudgetSegmentBreakdown>>();

  const pOrgs = await database.projectVersionOrganization.find({
    where: {
      projectVersionId: {
        [Op.IN]: projectVersionIds,
      },
    },
  });

  const orgsByProjectVersion = groupObjectsByProperty(
    pOrgs,
    'projectVersionId'
  );

  for (const [projectId, p] of projects.entries()) {
    // There should be only 1 segment with name BUDGET_SEGMENTATION_BY_ORG
    // for any project (except those with no budget)
    const segments = segmentsByProjectVersion.get(p.projectVersion.id);

    // Handle $0 projects with no budget segments
    if (!segments && p.projectVersion.currentRequestedFunds === '0') {
      result.set(projectId, []);
      continue;
    }

    const segment = segments?.size === 1 ? [...segments][0] : null;
    if (!segment) {
      continue;
    }

    const breakdowns = breakdownsBySegment.get(segment.id) || new Set();

    const projectResult: ProjectBudgetSegmentBreakdown[] = [];

    for (const b of breakdowns) {
      const content = b.content;

      const amountUSD =
        typeof content.amount === 'string'
          ? parseInt(content.amount)
          : content.amount === null
          ? 0
          : content.amount;

      // Determine all entities associated with the breakdown

      let globalCluster: GlobalClusterId | null = null;
      let governingEntity: GoverningEntityId | null = null;
      let organization: OrganizationId | null = null;

      const entities = entitiesByBreakdown.get(b.id) || new Set();
      for (const e of entities) {
        if (e.objectType === 'globalCluster') {
          globalCluster = createBrandedValue(e.objectId);
        }
        if (e.objectType === 'governingEntity') {
          governingEntity = createBrandedValue(e.objectId);
        }
        if (e.objectType === 'organization') {
          organization = createBrandedValue(e.objectId);
        }
      }

      if (!governingEntity || !organization) {
        throw new Error(`Missing entities for breakdown ${b.id}`);
      }

      if (!globalCluster) {
        log.warn(
          `Budget segment breakdown ${b.id} is missing a global cluster`
        );
        // Some projects seem to be missing global cluster entities
        // This is fairly uncommon, but we can mitigate this by checking what
        // global clusters are associated with the governing entity
        const gca = await database.globalClusterAssociation.find({
          where: {
            governingEntityId: governingEntity,
          },
        });
        if (gca.length === 1) {
          globalCluster = gca[0].globalClusterId;
        } else {
          throw new Error(
            `Missing global cluster entity for breakdown ${b.id}`
          );
        }
      }

      projectResult.push({
        amountUSD,
        globalCluster,
        governingEntity,
        organization,
      });
    }

    // Ensure that the sum of the projectResults matches the overall project budget

    const sum = projectResult.reduce((sum, v) => sum + v.amountUSD, 0);
    if (sum.toString() !== p.projectVersion.currentRequestedFunds) {
      if (ignoreInconsistentBudgets) {
        // Don't add the data for this project to the result
        continue;
      } else {
        throw new Error(
          `Project budget breakdown inconsistent for ${p.projectVersion}`
        );
      }
    }

    // Ensure that the organization IDs match the projectVersionOrganization
    const budgetOrgIDs = new Set(projectResult.map((i) => i.organization));
    const prvOrgIDs = new Set(
      [...(orgsByProjectVersion.get(p.projectVersion.id) || [])].map(
        (pvo) => pvo.organizationId
      )
    );

    if (!isEqual(budgetOrgIDs, prvOrgIDs)) {
      /*
       * A project's organizations have been updated (likely due to merging)
       * but the project budget segments have not been correctly updated.
       *
       * In some cases we'll be able to repair this automatically,
       * but in some cases (e.g. multi-org projects where both have been merged)
       * it may not be possible to automatically determine what the fix is
       */
      const missingOrgs = [...budgetOrgIDs].filter((id) => !prvOrgIDs.has(id));
      const unusedOrgs = [...prvOrgIDs].filter((id) => !budgetOrgIDs.has(id));

      if (missingOrgs.length === 1 && unusedOrgs.length === 1) {
        for (const i of projectResult) {
          if (i.organization === missingOrgs[0]) {
            i.organization = unusedOrgs[0];
          }
        }
      } else {
        /* istanbul ignore if */
        throw new Error(
          `Unable to determine correct orgs for ${p.projectVersion}`
        );
      }
    }

    result.set(projectId, projectResult);
  }

  return result;
};
