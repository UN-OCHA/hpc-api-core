import type { Knex } from 'knex';
import type { Database } from '..';
import { deleteAuthTarget } from '../../auth';
import { NotFoundError, PreconditionFailedError } from '../../util/error';
import type { ParticipantId } from '../models/participant';
import type { ProjectId } from '../models/project';

export const deleteProjectById = async (
  database: Database,
  projectToDelete: ProjectId,
  authGrantRevoker: ParticipantId,
  trx: Knex.Transaction<any, any>
) => {
  const project = await database.project.findOne({
    where: { id: projectToDelete },
    trx,
  });

  if (!project) {
    throw new NotFoundError(`No project with ID ${projectToDelete}`);
  }

  // Cannot delete already published project
  if (
    project.latestVersionId !== null &&
    project.currentPublishedVersionId === project.latestVersionId
  ) {
    throw new PreconditionFailedError(
      `Latest version of project with ID ${project.id} has already been published`
    );
  }

  const projectVersions = await database.projectVersion.find({
    where: { projectId: project.id },
    trx,
  });

  if (projectVersions.length > 1) {
    const currentLatestVersion = projectVersions.find(
      (pv) => pv.id === project.latestVersionId
    );

    if (!currentLatestVersion) {
      throw new Error(
        `Cannot find version with ID ${project.latestVersionId} for project ${project.id}`
      );
    }

    const newMaxVersion = currentLatestVersion.version - 1;
    const newLatestVersion = projectVersions.find(
      (pv) => pv.version === newMaxVersion
    );

    if (!newLatestVersion) {
      throw new Error(
        `Cannot find version ${newMaxVersion} for project ${project.id}`
      );
    }

    await database.project.update({
      values: { latestVersionId: newLatestVersion.id },
      where: { id: project.id },
      trx,
    });

    await database.projectVersion.destroy({
      where: { id: currentLatestVersion.id },
      trx,
    });

    // Delete weak references

    // References to projectVersion in categoryRef aren't being
    // used anymore, so, remove this if data ever gets cleaned up
    await database.categoryRef.destroy({
      where: {
        objectType: 'projectVersion',
        objectID: currentLatestVersion.id,
      },
      trx,
    });
  } else {
    const linkedToFlows = await database.flowObject.find({
      where: {
        objectType: 'project',
        objectID: project.id,
      },
      trx,
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
      trx,
    });

    // Unlink all cloned projects
    await database.project.update({
      values: { sourceProjectId: null },
      where: {
        id: { [database.Op.IN]: clonedProjects.map((p) => p.id) },
      },
      trx,
    });

    await database.project.destroy({
      where: { id: project.id },
      trx,
    });

    // Delete weak references
    await database.expiredData.destroy({
      where: { objectType: 'project', objectId: project.id },
      trx,
    });

    // Clean up all references in auth tables
    await deleteAuthTarget(
      database,
      { type: 'project', targetId: projectToDelete },
      authGrantRevoker,
      trx
    );
  }
};
