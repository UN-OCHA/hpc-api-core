import { EntityPrototypeId } from '../../db/models/entityPrototype';
import { GoverningEntityId } from '../../db/models/governingEntity';
import { PlanId } from '../../db/models/plan';
import { Database } from '../../db/type';
import { InstanceDataOfModel } from '../../db/util/raw-model';
import { organizeObjectsByUniqueProperty } from '../../util';

/**
 * A map from governing entity ids to an object that contains both the
 * governingEntity and governingEntityVersion for each entry.
 */
export type MapOfGoverningEntities = Map<
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
  prototypes: Map<
    EntityPrototypeId,
    InstanceDataOfModel<Database['entityPrototype']>
  >;
}): Promise<MapOfGoverningEntities> => {
  const ges = await database.governingEntity.find({
    where: {
      planId,
    },
  });
  const gevs = await database.governingEntityVersion.find({
    where: (builder) =>
      builder
        .whereIn(
          'governingEntityId',
          ges.map((ge) => ge.id)
        )
        .andWhere('latestVersion', true),
  });
  const gevsByGoverningEntityId = organizeObjectsByUniqueProperty(
    gevs,
    'governingEntityId'
  );
  const result: MapOfGoverningEntities = new Map();
  for (const governingEntity of ges) {
    const governingEntityVersion = gevsByGoverningEntityId.get(
      governingEntity.id
    );
    if (!governingEntityVersion) {
      throw new Error(
        `Missing governing entity version for ${governingEntity.id}`
      );
    }
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

const composeCustomReferenceForGoverningEntity = ({
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
  prototypes: Map<
    EntityPrototypeId,
    InstanceDataOfModel<Database['entityPrototype']>
  >;
}): string => {
  const prototype = prototypes.get(governingEntity.entityPrototypeId);
  if (!prototype) {
    throw new Error('Missing prototype');
  }
  return `${prototype.refCode}${governingEntityVersion.customReference}`;
};
