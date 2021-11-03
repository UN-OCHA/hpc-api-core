import { PlanId } from '../../db/models/plan';
import { ProjectId } from '../../db/models/project';
import { Database } from '../../db/type';
import { InstanceOfModel } from '../../db/util/types';
import { isDefined, organizeObjectsByUniqueProperty } from '../../util';

export interface ProjectData {
  project: InstanceOfModel<Database['project']>;
  projectVersion: InstanceOfModel<Database['projectVersion']>;
  workflowStatus: InstanceOfModel<Database['workflowStatusOption']> | null;
}

export async function getAllProjectsForPlan({
  database,
  planId,
}: {
  database: Database;
  planId: PlanId;
  version: 'latest';
}): Promise<Map<ProjectId, ProjectData>> {
  const pvps = await database.projectVersionPlan.find({
    where: {
      planId,
    },
  });
  const pvpsByProjectVersionId = organizeObjectsByUniqueProperty(
    pvps,
    'projectVersionId'
  );
  const projectVersions = await database.projectVersion.find({
    where: (builder) =>
      builder.whereIn('id', [
        ...new Set(pvps.map((pvp) => pvp.projectVersionId)),
      ]),
  });
  const pvsById = organizeObjectsByUniqueProperty(projectVersions, 'id');
  const projects = await database.project.find({
    where: (builder) =>
      builder.whereIn('id', [
        ...new Set(projectVersions.map((pv) => pv.projectId)),
      ]),
  });
  const workflowStatuses = await database.workflowStatusOption.find({
    where: (builder) =>
      builder.whereIn(
        'id',
        [...new Set(pvps.map((pvp) => pvp.workflowStatusOptionId))].filter(
          isDefined
        )
      ),
  });
  const workflowStatusById = organizeObjectsByUniqueProperty(
    workflowStatuses,
    'id'
  );

  const result = new Map<ProjectId, ProjectData>();
  for (const project of projects) {
    if (!project.latestVersionId) {
      // Project only has ID and no base data yet, ignore
      continue;
    }
    const projectVersion = pvsById.get(project.latestVersionId);
    if (!projectVersion) {
      // Project likely has older version assigned to plan but not current
      // version, okay to ignore
      continue;
    }
    // Sanity check that the project version is actually associated with
    // this project
    if (projectVersion.projectId !== project.id) {
      throw new Error('Data inconsistency found');
    }
    const pvp = pvpsByProjectVersionId.get(projectVersion.id);
    /* istanbul ignore if - this should not occur*/
    if (!pvp) {
      throw new Error('Unexpected error');
    }
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
