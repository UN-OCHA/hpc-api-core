import type { Database } from '../../db';
import type { PlanId } from '../../db/models/plan';
import { Op } from '../../db/util/conditions';

/**
 * Get all global clusters that are associated with plan's governing entities
 */
export const getAllGlobalClustersForPlan = async ({
  database,
  planId,
  version,
}: {
  database: Database;
  planId: PlanId;
  version: 'current' | 'latest';
}) => {
  const governingEntities = await database.governingEntity.find({
    where: {
      planId,
      ...(version === 'latest'
        ? { latestVersion: true }
        : { currentVersion: true }),
    },
  });

  const globalClusterAssociations =
    await database.globalClusterAssociation.find({
      where: {
        governingEntityId: {
          [Op.IN]: governingEntities.map((ge) => ge.id),
        },
      },
    });

  return await database.globalCluster.find({
    where: {
      id: {
        [database.Op.IN]: globalClusterAssociations.map(
          (gca) => gca.globalClusterId
        ),
      },
    },
  });
};
