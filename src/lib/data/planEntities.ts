import { findAndOrganizeObjectsByUniqueProperty } from '../../db/fetching';
import type { EntityPrototypeId } from '../../db/models/entityPrototype';
import type { GoverningEntityId } from '../../db/models/governingEntity';
import type { PlanId } from '../../db/models/plan';
import type { PlanEntityId } from '../../db/models/planEntity';
import type { Database } from '../../db/type';
import { Op } from '../../db/util/conditions';
import type { InstanceDataOfModel } from '../../db/util/raw-model';
import {
  annotatedMap,
  getRequiredData,
  getRequiredDataByValue,
  isDefined,
  type AnnotatedMap,
} from '../../util';
import type { MapOfGoverningEntities } from './governingEntities';

export type ValidatedPlanEntity = {
  id: PlanEntityId;
  type: string;
  customRef: string;
  description: null | string;
  /**
   * List of any entities that this one "supports"
   * (e.g. specific objectives support strategic objectives)
   */
  supports: PlanEntityId[];
  governingEntity: null | GoverningEntityId;
};

export type ValidatedPlanEntities = AnnotatedMap<
  PlanEntityId,
  ValidatedPlanEntity
>;

/**
 * Get all of the entities for a particular plan,
 * validate the consistency of data, and return it in a useful format
 */
export const getAndValidateAllPlanEntities = async ({
  database,
  planId,
  governingEntities,
  version,
  prototypes,
  allowMissingPlanEntities,
  skipValidation = false,
}: {
  database: Database;
  planId: PlanId;
  /**
   * A map from governing entities that include the version to be used when
   * generating references
   */
  governingEntities: MapOfGoverningEntities;
  version: 'latest' | 'current';
  /**
   * A map of prototypes that **must** include the prototype for governing
   * entities of this plan.
   *
   * Usually the full list of prototypes for a plan is passed in.
   */
  prototypes: AnnotatedMap<
    EntityPrototypeId,
    InstanceDataOfModel<Database['entityPrototype']>
  >;
  /**
   * If set to true,
   * don't throw an error when a plan entity that another references in its
   * `supports` list is missing.
   *
   * This can happen for example when another entity is soft-deleted.
   */
  allowMissingPlanEntities?: boolean;
  /**
   * Skip validation when fetching data from tables which have
   * JSON columns, as those are expensive to verify
   */
  skipValidation?: boolean;
}): Promise<ValidatedPlanEntities> => {
  const planEntities = await database.planEntity.find({
    where: {
      planId,
      ...(version === 'latest'
        ? { latestVersion: true }
        : { currentVersion: true }),
    },
  });
  const planEntityIDs = new Set(planEntities.map((pe) => pe.id));

  const pevsByPlanEntityId = await findAndOrganizeObjectsByUniqueProperty(
    database.planEntityVersion,
    (t) =>
      t.find({
        where: {
          planEntityId: {
            [Op.IN]: planEntityIDs,
          },
          ...(version === 'latest'
            ? { latestVersion: true }
            : { currentVersion: true }),
        },
        skipValidation,
      }),
    'planEntityId'
  );

  const result: ValidatedPlanEntities = annotatedMap('planEntity');

  for (const planEntity of planEntities) {
    const planEntityVersion = getRequiredData(
      pevsByPlanEntityId,
      planEntity,
      'id'
    );

    const refAndType = getCustomReferenceAndTypeForPlanEntity({
      planEntity,
      planEntityVersion,
      prototypes,
      governingEntities,
    });

    const entityDetails: ValidatedPlanEntity = {
      id: planEntity.id,
      type: refAndType.type,
      customRef: refAndType.customRef,
      description: null,
      supports: [],
      governingEntity: planEntity.parentGoverningEntityId,
    };

    // Use entity details if possible
    if (planEntityVersion.value) {
      // Able to inspect entity details
      entityDetails.description = planEntityVersion.value.description;

      if (
        planEntityVersion.value.support &&
        Array.isArray(planEntityVersion.value.support)
      ) {
        const supportingPlanEntityIds = planEntityVersion.value.support
          .flatMap((s) => s?.planEntityIds)
          .filter(isDefined);
        // Check that the list of planEntityIds is valid
        const missing = supportingPlanEntityIds.filter(
          (id) => !planEntityIDs.has(id)
        );
        if (!allowMissingPlanEntities && missing.length > 0) {
          throw new Error(
            `Missing supporting planEntityIds: ${missing.join(', ')}`
          );
        }

        // TODO: Check that the plan entities pass the canSupport requirements
        // specified in the prototype, including matching the cardinality
        entityDetails.supports = supportingPlanEntityIds.filter((id) =>
          planEntityIDs.has(id)
        );
      }
    }

    result.set(entityDetails.id, entityDetails);
  }

  return result;
};

/**
 * Given a particular plan entity,
 * return a list of all entity IDs that it supports, and any that they support,
 * etc... including the ID of the plan entity itself
 */
export const calculateReflectiveTransitiveEntitySupport = ({
  planEntity,
  planEntities,
}: {
  planEntity: ValidatedPlanEntity;
  planEntities: ValidatedPlanEntities;
}): Set<PlanEntityId> => {
  const supportsEntitiesIDs = new Set<PlanEntityId>();
  const entities = [planEntity];
  let entity: ValidatedPlanEntity | undefined;
  while ((entity = entities.pop())) {
    // Prevent loops by skipping entities we have already processed
    if (supportsEntitiesIDs.has(entity.id)) {
      continue;
    }
    supportsEntitiesIDs.add(entity.id);
    for (const supportedEntity of entity.supports) {
      const e = getRequiredDataByValue(
        planEntities,
        `id: ${supportedEntity}`,
        () => supportedEntity
      );
      entities.push(e);
    }
  }
  return supportsEntitiesIDs;
};

const getCustomReferenceAndTypeForPlanEntity = ({
  planEntity,
  planEntityVersion,
  prototypes,
  governingEntities,
}: {
  planEntity: InstanceDataOfModel<Database['planEntity']>;
  planEntityVersion: InstanceDataOfModel<Database['planEntityVersion']>;
  /**
   * A map of prototypes that **must** include the prototype for the entity.
   *
   * Usually the full list of prototypes for a plan is passed in.
   */
  prototypes: AnnotatedMap<
    EntityPrototypeId,
    InstanceDataOfModel<Database['entityPrototype']>
  >;
  /**
   * A map from governing entity IDs to an object containing the .
   *
   * This may **must** include any governing entity referenced by the entity,
   * usually the full list of governing entities for a plan is passed in.
   */
  governingEntities: MapOfGoverningEntities;
}): {
  customRef: string;
  type: string;
} => {
  const prototype = getRequiredData(
    prototypes,
    planEntity,
    'entityPrototypeId'
  );
  let ref = '';
  if (planEntity.parentGoverningEntityId) {
    const ge = getRequiredDataByValue(
      governingEntities,
      planEntity,
      (pE) => pE.parentGoverningEntityId
    );
    ref = `${ge.customRef}/`;
  }
  ref += `${prototype.refCode}${planEntityVersion.customReference}`;
  if (!prototype.refCode) {
    throw new Error(`Missing refCode for entityPrototype ${prototype.id}`);
  }
  return {
    customRef: ref,
    type: prototype.refCode,
  };
};
