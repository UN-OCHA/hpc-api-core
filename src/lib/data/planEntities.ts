import { EntityPrototypeId } from '../../db/models/entityPrototype';
import { GoverningEntityId } from '../../db/models/governingEntity';
import { PlanId } from '../../db/models/plan';
import { PlanEntityId } from '../../db/models/planEntity';
import { Database } from '../../db/type';
import { InstanceDataOfModel } from '../../db/util/raw-model';
import { organizeObjectsByUniqueProperty } from '../../util';
import { MapOfGoverningEntities } from './governingEntities';

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

export type ValidatedPlanEntities = Map<PlanEntityId, ValidatedPlanEntity>;

/**
 * Get all of the entities for a particular plan,
 * validate the consistency of data, and return it in a useful format
 */
export const getAndValidateAllPlanEntities = async ({
  database,
  planId,
  governingEntities,
  prototypes,
}: {
  database: Database;
  planId: PlanId;
  /**
   * A map from governing entities that include the version to be used when
   * generating references
   */
  governingEntities: MapOfGoverningEntities;
  version: 'latest';
  /**
   * A map of prototypes that **must** include the prototype for governing
   * entities of this plan.
   *
   * Usually the full list of prototypes for a plan is passed in.
   */
  prototypes: Map<
    EntityPrototypeId,
    InstanceDataOfModel<Database['entityPrototype']>
  >;
}): Promise<ValidatedPlanEntities> => {
  const planEntities = await database.planEntity.find({
    where: {
      planId,
    },
  });
  const planEntityIDs = new Set(planEntities.map((pe) => pe.id));

  const pevs = await database.planEntityVersion.find({
    where: (builder) =>
      builder
        .whereIn(
          'planEntityId',
          planEntities.map((pe) => pe.id)
        )
        .andWhere('latestVersion', true),
  });
  const pevsByPlanEntityId = organizeObjectsByUniqueProperty(
    pevs,
    'planEntityId'
  );

  const entitiesAssociation = await database.entitiesAssociation.find({
    where: (builder) =>
      builder
        .whereIn(
          'childId',
          planEntities.map((pe) => pe.id)
        )
        .andWhere('parentType', 'governingEntity')
        .andWhere('childType', 'planEntity'),
  });
  const eaByChildId = organizeObjectsByUniqueProperty(
    entitiesAssociation,
    'childId'
  );

  const result: ValidatedPlanEntities = new Map();

  for (const planEntity of planEntities) {
    const planEntityVersion = pevsByPlanEntityId.get(planEntity.id);
    if (!planEntityVersion) {
      throw new Error('Missing plan entity version');
    }

    const prototype = prototypes.get(planEntity.entityPrototypeId);
    if (!prototype) {
      throw new Error('Missing prototype');
    }

    const refAndType = getCustomReferenceAndTypeForPlanEntity({
      planEntity,
      planEntityVersion,
      prototypes,
      entityAssociations: eaByChildId,
      governingEntities,
    });

    const entityDetails: ValidatedPlanEntity = {
      id: planEntity.id,
      type: refAndType.type,
      customRef: refAndType.customRef,
      description: null,
      supports: [],
      governingEntity: eaByChildId.get(planEntity.id)?.parentId || null,
    };

    // Use entity details if possible
    if (planEntityVersion.value) {
      // Able to inspect entity details
      entityDetails.description = planEntityVersion.value.description;
      const supportingPlanEntityIds = planEntityVersion.value.support.flatMap(
        (s) => s.planEntityIds
      );
      // Check that the list of planEntityIds is valid
      const missing = supportingPlanEntityIds.filter(
        (id) => !planEntityIDs.has(id)
      );
      if (missing.length > 0) {
        throw new Error(
          `Missing supporting planEntityIds: ${missing.join(', ')}`
        );
      }

      // TODO: Check that the plan entities pass the canSupport requirements
      // specified in the prototype, including matching the cardinality
      entityDetails.supports = supportingPlanEntityIds;
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
  const supportsEntitiesIDs: Set<PlanEntityId> = new Set();
  const entities = [planEntity];
  let entity: ValidatedPlanEntity | undefined;
  while ((entity = entities.pop())) {
    // Prevent loops by skipping entities we have already processed
    if (supportsEntitiesIDs.has(entity.id)) {
      continue;
    }
    supportsEntitiesIDs.add(entity.id);
    for (const supportedEntity of entity.supports) {
      const e = planEntities.get(supportedEntity);
      if (!e) {
        throw new Error(`Missing plan entity ${supportedEntity}`);
      }
      entities.push(e);
    }
  }
  return supportsEntitiesIDs;
};

const getCustomReferenceAndTypeForPlanEntity = ({
  planEntity,
  planEntityVersion,
  prototypes,
  entityAssociations,
  governingEntities,
}: {
  planEntity: InstanceDataOfModel<Database['planEntity']>;
  planEntityVersion: InstanceDataOfModel<Database['planEntityVersion']>;
  /**
   * A map of prototypes that **must** include the prototype for the entity.
   *
   * Usually the full list of prototypes for a plan is passed in.
   */
  prototypes: Map<
    EntityPrototypeId,
    InstanceDataOfModel<Database['entityPrototype']>
  >;
  /**
   * A map of associations from the `entitiesAssociation` table, that **must**
   * include any rows that reference this entity.
   */
  entityAssociations: Map<
    PlanEntityId,
    InstanceDataOfModel<Database['entitiesAssociation']>
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
  const prototype = prototypes.get(planEntity.entityPrototypeId);
  if (!prototype) {
    throw new Error('Missing prototype');
  }
  const parent = entityAssociations.get(planEntity.id);
  let ref = '';
  if (parent) {
    const ge = governingEntities.get(parent.parentId);
    if (!ge) {
      throw new Error('Missing governing entity');
    }
    ref = `${ge.customRef}/`;
  }
  ref += `${prototype.refCode}${planEntityVersion.customReference}`;
  if (!prototype.refCode) {
    throw new Error('Missing refCode');
  }
  return {
    customRef: ref,
    type: prototype.refCode,
  };
};
