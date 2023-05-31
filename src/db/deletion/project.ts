import type { Database } from '..';
import { NotFoundError, PreconditionFailedError } from '../../util/error';
import type { ParticipantId } from '../models/participant';
import type { ProjectId } from '../models/project';

export const deleteProjectById = async (
  database: Database,
  projectToDelete: ProjectId,
  authGrantRevoker: ParticipantId
) => {
  const project = await database.project.get(projectToDelete);

  if (!project) {
    throw new NotFoundError(`No project with ID ${projectToDelete}`);
  }

  // Cannot delete already published project
  if (project.currentPublishedVersionId) {
    throw new PreconditionFailedError(
      `Project with ID ${project.id} has already been published`
    );
  }

  if (project.latestVersionId) {
    const latestVersion = await database.projectVersion.get(
      project.latestVersionId
    );

    if (latestVersion?.version !== 1) {
      throw new PreconditionFailedError(
        `More than one version of project with ID ${project.id} has been created`
      );
    }
  }

  const linkedToFlows = await database.flowObject.find({
    where: {
      objectType: 'project',
      objectID: project.id,
    },
  });
  const totalLinkedFlows = linkedToFlows.length;

  if (totalLinkedFlows) {
    throw new PreconditionFailedError(
      `Cannot delete project because it is linked to flows with ID: ${linkedToFlows
        .map((f) => f.flowID)
        .slice(0, 10)
        .join(', ')}.${
        totalLinkedFlows > 10
          ? ` There are ${
              totalLinkedFlows - 10
            } more flows, we're just showing the first 10`
          : ''
      }`
    );
  }

  const clonedProjects = await database.project.find({
    where: { sourceProjectId: project.id },
  });

  // Unlink all cloned projects
  await database.project.update({
    values: { sourceProjectId: null },
    where: {
      id: { [database.Op.IN]: clonedProjects.map((p) => p.id) },
    },
  });

  await database.project.destroy({
    where: { id: project.id },
  });

  // Delete weak references
  await database.expiredData.destroy({
    where: { objectType: 'project', objectId: project.id },
  });

  // Unfortunately, due to DB constraints, we must keep auth
  // targets pointing to projects which no longer exist
  // Thus, we only remove the entry from `authGrants` table
  const targets = await database.authTarget.find({
    where: {
      type: 'project',
      targetId: project.id,
    },
  });
  const grants = await database.authGrant.find({
    where: { target: { [database.Op.IN]: targets.map((t) => t.id) } },
  });
  for (const grant of grants) {
    await database.authGrant.update(
      {
        grantee: grant.grantee,
        roles: [],
        target: grant.target,
      },
      authGrantRevoker
    );
  }
};
