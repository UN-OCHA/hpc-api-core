import type { Database } from '../../db';
import type { LocationId } from '../../db/models/location';
import type { PlanId } from '../../db/models/plan';
import type { InstanceOfModel } from '../../db/util/types';
import { getOrCreate } from '../../util';
import { NotFoundError } from '../../util/error';

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

export const getAllCountryLocations = async (
  database: Database,
  countryId: LocationId
): Promise<Map<number, Array<InstanceOfModel<Database['location']>>>> => {
  const country = await database.location.findOne({
    where: {
      id: countryId,
      adminLevel: 0,
      status: 'active',
      parentId: { [database.Op.IS_NULL]: true },
    },
  });

  if (!country) {
    throw new NotFoundError(
      `No country with ID ${countryId}. ` +
        `Make sure location with ID ${countryId} is an active country (i.e. admin 0 location)`
    );
  }

  let previousAdminLevelIds = [country.id];
  let nextAdminLevel = 1;
  const countryLocationsByAdminLevel = new Map<
    number,
    Array<InstanceOfModel<Database['location']>>
  >([[0, [country]]]);

  while (previousAdminLevelIds.length) {
    const locations = await database.location.find({
      where: {
        parentId: { [database.Op.IN]: previousAdminLevelIds },
        adminLevel: nextAdminLevel,
        status: 'active',
      },
    });

    for (const location of locations) {
      const countriesInAdminLevel = getOrCreate(
        countryLocationsByAdminLevel,
        nextAdminLevel,
        () => []
      );
      countriesInAdminLevel.push(location);
    }

    previousAdminLevelIds = locations.map((l) => l.id);
    nextAdminLevel++;
  }

  return countryLocationsByAdminLevel;
};
