import type { Database } from '../../db';
import type { PlanId } from '../../db/models/plan';

export const getPlanCountries = async (
  database: Database,
  planId: PlanId,
  version: 'current' | 'latest'
) => {
  const planLocations = await database.planLocation.find({
    where: {
      planId,
      ...(version === 'latest'
        ? { latestVersion: true }
        : { currentVersion: true }),
    },
  });

  return database.location.find({
    where: {
      id: { [database.Op.IN]: planLocations.map((pl) => pl.locationId) },
      adminLevel: 0,
      status: 'active',
      parentId: { [database.Op.IS_NULL]: true },
    },
  });
};
