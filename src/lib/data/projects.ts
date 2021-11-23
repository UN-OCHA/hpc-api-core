import { GoverningEntityId } from '../../db/models/governingEntity';
import { OrganizationId } from '../../db/models/organization';
import { findAndOrganizeObjectsByUniqueProperty } from '../../db/fetching';
import { PlanId } from '../../db/models/plan';
import { ProjectId } from '../../db/models/project';
import { Database } from '../../db/type';
import { InstanceOfModel } from '../../db/util/types';
import { getRequiredData, groupObjectsByProperty, isDefined } from '../../util';

export interface ProjectData {
  project: InstanceOfModel<Database['project']>;
  projectVersion: InstanceOfModel<Database['projectVersion']>;
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
        where: (builder) =>
          builder.whereIn('id', [
            ...new Set(pvps.map((pvp) => pvp.projectVersionId)),
          ]),
      }),
    'id'
  );
  const projectVersions = [...pvsById.values()];
  const projects = await database.project.find({
    where: (builder) =>
      builder.whereIn('id', [
        ...new Set(projectVersions.map((pv) => pv.projectId)),
      ]),
  });
  const workflowStatusById = await findAndOrganizeObjectsByUniqueProperty(
    database.workflowStatusOption,
    (t) =>
      t.find({
        where: (builder) =>
          builder.whereIn(
            'id',
            [...new Set(pvps.map((pvp) => pvp.workflowStatusOptionId))].filter(
              isDefined
            )
          ),
      }),
    'id'
  );

  const result = new Map<ProjectId, ProjectData>();
  for (const project of projects) {
    if (!project.latestVersionId || !project.currentPublishedVersionId) {
      // Project only has ID and no base data yet, ignore
      continue;
    }
    const projectVersion =
      version === 'current'
        ? pvsById.get(project.currentPublishedVersionId)
        : pvsById.get(project.latestVersionId);
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
      workflowStatus,
    });
  }

  return result;
}

export async function getOrganizationIDsForProjects({
  database,
  projects,
}: {
  database: Database;
  projects: Map<ProjectId, ProjectData>;
}): Promise<Map<ProjectId, Set<OrganizationId>>> {
  const projectVersionIds = [...projects.values()].map(
    (p) => p.projectVersion.id
  );

  const groupedPVOs = groupObjectsByProperty(
    await database.projectVersionOrganization.find({
      where: (builder) =>
        builder.whereIn('projectVersionId', projectVersionIds),
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

export async function getGoverningEntityIDsForProjects({
  database,
  projects,
}: {
  database: Database;
  projects: Map<ProjectId, ProjectData>;
}): Promise<Map<ProjectId, Set<GoverningEntityId>>> {
  const projectVersionIds = [...projects.values()].map(
    (p) => p.projectVersion.id
  );

  const groupedPVGEs = groupObjectsByProperty(
    await database.projectVersionGoverningEntity.find({
      where: (builder) =>
        builder.whereIn('projectVersionId', projectVersionIds),
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
