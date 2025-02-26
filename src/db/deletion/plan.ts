import type { Knex } from 'knex';
import type { Database } from '..';
import { deleteAuthTarget } from '../../auth';
import { NotFoundError, UnprocessableEntityError } from '../../util/error';
import type { ParticipantId } from '../models/participant';
import type { PlanId } from '../models/plan';

export const checkIfPlanIsDeletable = async (
  database: Database,
  planId: PlanId
) => {
  const plan = await database.plan.get(planId);
  if (!plan) {
    throw new NotFoundError(`Plan with ID ${planId} does not exist`);
  }

  // Abort if there are projects under this plan
  const planProjects = await database.projectVersionPlan.find({
    where: { planId },
  });
  if (planProjects.length) {
    throw new UnprocessableEntityError(
      `Plan with ID ${planId} has projects, cannot delete`
    );
  }

  // Abort if plan or its plan/governing entities are linked to any flow
  const planEntities = await database.planEntity.find({
    where: { planId },
  });
  const governingEntities = await database.governingEntity.find({
    where: { planId },
  });
  const flows = await database.flowObject.find({
    where: {
      [database.Cond.OR]: [
        {
          objectType: 'plan',
          objectID: planId,
        },
        {
          objectType: 'governingEntity',
          objectID: {
            [database.Op.IN]: governingEntities.map((ge) => ge.id),
          },
        },
        {
          objectType: 'planEntity',
          objectID: {
            [database.Op.IN]: planEntities.map((pe) => pe.id),
          },
        },
      ],
    },
  });
  if (flows.length) {
    throw new UnprocessableEntityError(
      `Plan with ID ${planId} or its entities are attached to flow(s), cannot delete`
    );
  }
};

export const deletePlanById = async (
  database: Database,
  planToDelete: PlanId,
  authGrantRevoker: ParticipantId,
  trx: Knex.Transaction<any, any>
) => {
  const plan = await database.plan.get(planToDelete);
  if (!plan) {
    throw new NotFoundError(`Plan with ID ${planToDelete} does not exist`);
  }

  // Unlink plan categories
  await database.categoryRef.destroy({
    where: {
      objectType: 'plan',
      objectID: planToDelete,
    },
    trx,
  });

  // Clean up all references in auth tables
  await deleteAuthTarget(
    database,
    { type: 'plan', targetId: planToDelete },
    authGrantRevoker,
    trx
  );

  /**
   * Related tables are purged through `ON DELETE CASCADE` foreign key constraints:
   *
   * `conditionField`
   *   - `conditionFieldReliesOn`
   *   - `procedureSectionField`
   * `procedureSection`
   *   - `procedureSectionField`
   * `planLocation`
   * `attachmentPrototype`
   * `attachment`
   *   - `attachmentVersion`
   *     - `projectVersionAttachment`
   *   - `measurement`
   *   - `projectVersionAttachment`
   * `planYear`
   * `planEmergency`
   * `planTag`
   * `disaggregationCategoryGroup`
   *   - `disaggregationCategory`
   * `disaggregationModel`
   * `entityPrototype`
   *   - `procedureEntityPrototype`
   *   - `planEntity`
   *     - `planEntityVersion`
   *   - `governingEntity`
   *     - `governingEntityVersion`
   *     - `globalClusterAssociation`
   * `planEntity`
   *   - `planEntityVersion`
   * `governingEntity`
   *   - `governingEntityVersion`
   *   - `globalClusterAssociation`
   * `procedureEntityPrototype`
   * `workflowStatusOption`
   *   - `workflowStatusOptionStep`
   * `planReportingPeriod`
   *   - `measurement`
   *     - `measurementVersion`
   * `planVersion`
   *
   * Note that attachments are soft deleted usually, but due to cascade deletion
   * in `attachment.planId` foreign key, they get hard deleted when a plan is
   * removed. This is the behavior we want, because we don't want to keep dead
   * data around and soft deletion should be used when attachment itself is deleted,
   * not when its integral parent (plan) no longer exists.
   *
   * But, even if we wanted to keep an attachment, it would not be possible,
   * because of the foresaid foreign key to plan ID being `NOT NULL`.
   */
  await database.plan.destroy({
    where: { id: planToDelete },
    trx,
  });
};
