import type { Database } from '../../db';
import type { InstanceDataOfModel } from '../../db/util/raw-model';

/**
 * `implementationStatus` is not a real column on `projectVersion`
 * table, but rather a function that computes implementation status
 * and can return one of four string values. Since using DB functions
 * is considered legacy, this method recreates the logic in code.
 */
export const getProjectVersionImplementationStatus = async (
  database: Database,
  projectVersion: InstanceDataOfModel<Database['projectVersion']>
): Promise<'published' | 'unpublished' | 'draft' | 'archived'> => {
  const project = await database.project.get(projectVersion.projectId);

  if (project?.currentPublishedVersionId === projectVersion.id) {
    return 'published';
  } else if (project?.latestVersionId === projectVersion.id) {
    if (project?.currentPublishedVersionId === null) {
      return 'unpublished';
    }

    return 'draft';
  }

  return 'archived';
};
