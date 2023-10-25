import type { Database } from '../../db';
import type { PlanId } from '../../db/models/plan';
import { Op } from '../../db/util/conditions';

/**
 * Get all global clusters that are associated with plan's governing entities
 */
export const getAllGlobalClustersForPlan = async ({
  database,
  planId,
}: {
  database: Database;
  planId: PlanId;
}) => {
  const governingEntities = await database.governingEntity.find({
    where: { planId },
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
