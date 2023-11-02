import { findAndOrganizeObjectsByUniqueProperty } from '../../db/fetching';
import type { EntityPrototypeId } from '../../db/models/entityPrototype';
import type { GoverningEntityId } from '../../db/models/governingEntity';
import type { PlanId } from '../../db/models/plan';
import type { Database } from '../../db/type';
import { Op } from '../../db/util/conditions';
import type { InstanceDataOfModel } from '../../db/util/raw-model';
import { annotatedMap, getRequiredData, type AnnotatedMap } from '../../util';

/**
 * A map from governing entity ids to an object that contains both the
 * governingEntity and governingEntityVersion for each entry.
 */
export type MapOfGoverningEntities = AnnotatedMap<
  GoverningEntityId,
  {
    governingEntity: InstanceDataOfModel<Database['governingEntity']>;
    governingEntityVersion: InstanceDataOfModel<
      Database['governingEntityVersion']
    >;
    customRef: string;
  }
>;

export const getAllGoverningEntitiesForPlan = async ({
  database,
  planId,
  prototypes,
}: {
  database: Database;
  planId: PlanId;
  version: 'latest';
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
}): Promise<MapOfGoverningEntities> => {
  const ges = await database.governingEntity.find({
    where: {
      planId,
    },
  });

  const gevsByGoverningEntityId = await findAndOrganizeObjectsByUniqueProperty(
    database.governingEntityVersion,
    (t) =>
      t.find({
        where: {
          latestVersion: true,
          governingEntityId: {
            [Op.IN]: ges.map((ge) => ge.id),
          },
        },
      }),
    'governingEntityId'
  );
  const result: MapOfGoverningEntities = annotatedMap('governingEntity');
  for (const governingEntity of ges) {
    const governingEntityVersion = getRequiredData(
      gevsByGoverningEntityId,
      governingEntity,
      'id'
    );
    const customRef = composeCustomReferenceForGoverningEntity({
      governingEntity,
      governingEntityVersion,
      prototypes,
    });
    result.set(governingEntity.id, {
      governingEntity,
      governingEntityVersion,
      customRef,
    });
  }
  return result;
};

export const composeCustomReferenceForGoverningEntity = ({
  governingEntity,
  governingEntityVersion,
  prototypes,
}: {
  governingEntity: InstanceDataOfModel<Database['governingEntity']>;
  governingEntityVersion: InstanceDataOfModel<
    Database['governingEntityVersion']
  >;
  /**
   * A map of prototypes that **must** include the prototype for the entity.
   *
   * Usually the full list of prototypes for a plan is passed in.
   */
  prototypes: AnnotatedMap<
    EntityPrototypeId,
    InstanceDataOfModel<Database['entityPrototype']>
  >;
}): string => {
  const prototype = getRequiredData(
    prototypes,
    governingEntity,
    'entityPrototypeId'
  );
  return `${prototype.refCode}${governingEntityVersion.customReference}`;
};
