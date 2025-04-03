import type { Knex } from 'knex';
import type { Database } from '..';
import { isDefined } from '../../util';
import { NotFoundError, PreconditionFailedError } from '../../util/error';
import type { OrganizationId } from '../models/organization';

/**
 * Organizations are soft deleted in the database. This method gives
 * a way to hard/soft delete an organization. If hard deleted, all of
 * its related data is hard deleted too.
 */
export const deleteOrganizationById = async (
  database: Database,
  organizationToDelete: OrganizationId,
  trx: Knex.Transaction,
  shouldHardDelete: boolean
) => {
  const organization = await database.organization.get(
    organizationToDelete,
    trx
  );

  if (!organization) {
    throw new NotFoundError(
      `Organization with ID ${organizationToDelete} not found`
    );
  }

  const flowObjects = await database.flowObject.find({
    where: {
      objectType: {
        [database.Op.IN]: ['organization', 'anonymizedOrganization'],
      },
      objectID: organization.id,
    },
    trx,
  });
  const flows = (
    await Promise.all(
      flowObjects.map((fo) =>
        database.flow.findOne({
          where: {
            id: fo.flowID,
            versionID: fo.versionID,
          },
          trx,
        })
      )
    )
  ).filter(isDefined);

  const projectVersions = await database.projectVersionOrganization.find({
    where: { organizationId: organization.id },
    trx,
  });

  if (flows.length > 0 || projectVersions.length > 0) {
    const flowIds = flows.map((flow) => flow.id).join(', ');
    const projectVersionIds = projectVersions
      .map((project) => project.projectVersionId)
      .join(', ');

    let errorMessage = 'Cannot delete organization.';
    if (flows.length > 0) {
      errorMessage += ` Associated flows: [${flowIds}].`;
    }
    if (projectVersions.length > 0) {
      errorMessage += ` Associated project versions: [${projectVersionIds}].`;
    }

    throw new PreconditionFailedError(errorMessage);
  }

  /**
   * Table `organization` also has a weak link in `budgetSegmentBreakdownEntity`
   * table, but those aren't explicitly cleaned up now, because there is a more
   * complex connection that is formed with `budgetSegment`, `budgetSegmentBreakdown`
   * and `budgetSegmentBreakdownEntity` tables, so if we only remove from the
   * last one, we'll still leave partial information. Instead, we rely that projects
   * linked to organization get cleaned up manually first, since this method
   * will refuse to delete organization that has projects
   */

  if (shouldHardDelete) {
    // Unlink organization categories
    await database.categoryRef.destroy({
      where: {
        objectType: 'organization',
        objectID: organization.id,
      },
      trx,
    });
  }

  /**
   * If hard deleted, the related tables are purged through `ON DELETE CASCADE` foreign key constraints:
   *
   * `organizationLocation`
   * `participantOrganization`
   * `planVersionOrganization`
   * `projectVersionOrganization` (but since projects must be unlinked manually, when a project
   *   is deleted, its foreign key constraint will remove entry from this table first)
   *
   * If (hard) deleted organization appears in `reportDetail` table, the `organizationID` column
   * will be set to `NULL` there, due to `ON DELETE SET NULL` foreign key constraint.
   */
  await database.organization.destroy({
    where: { id: organization.id },
    forceHardDeletion: shouldHardDelete,
    trx,
  });
};
