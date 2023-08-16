import type { Database } from '../../db';
import type { PlanId } from '../../db/models/plan';
import { NotFoundError } from '../../util/error';

export const getPlanYears = async (
  database: Database,
  planId: PlanId,
  version: 'current' | 'latest'
) => {
  const planYears = await database.planYear.find({
    where: {
      planId,
      ...(version === 'latest'
        ? { latestVersion: true }
        : { currentVersion: true }),
    },
  });

  if (planYears.length === 0) {
    throw new NotFoundError(
      `Plan with ID ${planId} doesn't have an associated year`
    );
  }

  const usageYears = await database.usageYear.getAll(
    planYears.map((p) => p.usageYearId)
  );

  return [...usageYears.values()].map((uy) => uy.year);
};
