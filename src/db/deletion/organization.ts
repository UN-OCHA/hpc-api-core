import type { Knex } from 'knex';
import type { Database } from '..';
import { splitIntoChunks } from '../../util';
import { PG_MAX_QUERY_PARAMS } from '../../util/consts';
import { NotFoundError, PreconditionFailedError } from '../../util/error';
import type { FlowId } from '../models/flow';
import type { OrganizationId } from '../models/organization';

/**
 * Since organization can appear on both source and destination side of same
 * flow, we only are interested in flows where it appears on any side
 */
const getUniqueFlowVersions = async (
  organizationId: OrganizationId,
  database: Database,
  trx: Knex.Transaction
) => {
  const flowObjects = await database.flowObject.find({
    where: {
      objectType: {
        [database.Op.IN]: ['organization', 'anonymizedOrganization'],
      },
      objectID: organizationId,
    },
    trx,
  });

  type Key = `${FlowId}-v${number}`;
  const seen = new Set<Key>();

  return flowObjects
    .map((fo) => ({
      id: fo.flowID,
      versionID: fo.versionID,
    }))
    .filter((flow) => {
      const key: Key = `${flow.id}-v${flow.versionID}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

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

  const uniqueFlowVersions = await getUniqueFlowVersions(
    organization.id,
    database,
    trx
  );
  // We double check in `flow` table, since flows can be soft deleted
  const flowVersions = (
    await Promise.all(
      splitIntoChunks(uniqueFlowVersions, PG_MAX_QUERY_PARAMS / 4).map(
        (orConditions) =>
          database.flow.find({
            where: {
              [database.Cond.OR]: orConditions,
            },
            trx,
          })
      )
    )
  ).flat();

  const projectVersions = await database.projectVersionOrganization.find({
    where: { organizationId: organization.id },
    trx,
  });

  if (flowVersions.length > 0 || projectVersions.length > 0) {
    const formatIds = (ids: string[], limit: number = 10) => {
      if (ids.length <= limit) {
        return ids.join(', ');
      }

      const displayedIds = ids.slice(0, limit).join(', ');
      const remainingCount = ids.length - limit;
      return `${displayedIds} ... (+ ${remainingCount.toLocaleString()} more)`;
    };

    const flows = flowVersions.map((flow) => `${flow.id} v${flow.versionID}`);
    const projectVersionIds = projectVersions.map((project) =>
      project.projectVersionId.toString()
    );

    let errorMessage = 'Cannot delete organization.';
    if (flowVersions.length > 0) {
      errorMessage += ` Associated flow versions: [${formatIds(flows)}].`;
    }
    if (projectVersions.length > 0) {
      errorMessage += ` Associated project versions: [${formatIds(projectVersionIds)}].`;
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
