import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { findAndOrganizeObjectsByUniqueProperty } from '../../db/fetching';
import { AttachmentId } from '../../db/models/attachment';
import {
  AttachmentPrototypeId,
  AttachmentType,
} from '../../db/models/attachmentPrototype';
import { GoverningEntityId } from '../../db/models/governingEntity';
import { ATTACHMENT_VERSION_VALUE } from '../../db/models/json/attachment';
import { PlanId } from '../../db/models/plan';
import { PlanEntityId } from '../../db/models/planEntity';
import { Database } from '../../db/type';
import { Op } from '../../db/util/conditions';
import { InstanceDataOfModel } from '../../db/util/raw-model';
import {
  AnnotatedMap,
  getRequiredData,
  getRequiredDataByValue,
} from '../../util';
import { ioTsErrorFormatter } from '../../util/io-ts';
import { SharedLogContext } from '../logging';
import { MapOfGoverningEntities } from './governingEntities';
import {
  calculateReflectiveTransitiveEntitySupport,
  ValidatedPlanEntities,
} from './planEntities';

const ATTACHMENT_DATA = t.union([
  t.type({
    type: t.literal('caseLoad'),
    value: ATTACHMENT_VERSION_VALUE['caseLoad'],
  }),
  t.type({
    type: t.literal('contact'),
    value: ATTACHMENT_VERSION_VALUE['contact'],
  }),
  t.type({
    type: t.literal('cost'),
    value: ATTACHMENT_VERSION_VALUE['cost'],
  }),
  t.type({
    type: t.literal('fileWebContent'),
    value: ATTACHMENT_VERSION_VALUE['fileWebContent'],
  }),
  t.type({
    type: t.literal('indicator'),
    value: ATTACHMENT_VERSION_VALUE['indicator'],
  }),
  t.type({
    type: t.literal('textWebContent'),
    value: ATTACHMENT_VERSION_VALUE['textWebContent'],
  }),
]);

type AttachmentData = t.TypeOf<typeof ATTACHMENT_DATA>;

type AttachmentParent =
  | { type: 'plan' }
  | { type: 'governingEntity'; id: GoverningEntityId }
  | { type: 'planEntity'; id: PlanEntityId };

export type AttachmentResult = {
  id: AttachmentId;
  customRef: string;
  /**
   * The part of the plan under which this attachment is directly nested
   */
  parent: AttachmentParent;
  /**
   * If set, this particular plan attachment is associated with the given
   * governing entity. This does not necessarily mean that data available
   * in `parent` is duplicated, because if `type` is `'planEntity'`,
   * this field can be populated via parent of a plan entity
   */
  governingEntity: GoverningEntityId | null;
  /**
   * List of all plan entities that this attachment is associated with,
   * along with any entities that are transitively supported
   */
  supportsEntities: PlanEntityId[];
  /**
   * The attachment type, along with the type-checked data from its value
   */
  data: AttachmentData;
};

type AttachmentResults = Map<AttachmentId, AttachmentResult>;

/**
 * Get all of the attachments of a particular type for a particular plan.
 *
 * In addition to fetching the attachments, this also validates the contents of
 * their value field, ensuring they are of the correct type.
 */
export const getAllAttachments = async ({
  database,
  planId,
  types,
  planEntities,
  governingEntities,
  log,
}: {
  database: Database;
  planId: PlanId;
  types: AttachmentType[];
  version: 'latest';
  /**
   * A map of plan entities, which **must** include any entity that is the
   * parent of the given attachment.
   *
   * Usually all the entities for a given plan are provided
   */
  planEntities: ValidatedPlanEntities;
  /**
   * A map of governing entities, which **must** include any governing entity
   * that is the parent of the given attachment.
   *
   * Usually all the governing entities for a given plan are provided
   */
  governingEntities: MapOfGoverningEntities;
  log: SharedLogContext;
}): Promise<AttachmentResults> => {
  const attachmentPrototypesById = await findAndOrganizeObjectsByUniqueProperty(
    database.attachmentPrototype,
    (t) =>
      t.find({
        where: {
          planId,
          type: {
            [Op.IN]: types,
          },
        },
      }),
    'id'
  );
  const attachments = await database.attachment.find({
    where: {
      planId,
      type: {
        [Op.IN]: types,
      },
    },
  });
  const attachmentVersionsByAttachmentId =
    await findAndOrganizeObjectsByUniqueProperty(
      database.attachmentVersion,
      (t) =>
        t.find({
          where: {
            latestVersion: true,
            attachmentId: {
              [Op.IN]: attachments.map((pa) => pa.id),
            },
          },
        }),
      'attachmentId'
    );
  const result: AttachmentResults = new Map();

  for (const attachment of attachments) {
    const attachmentVersion = getRequiredData(
      attachmentVersionsByAttachmentId,
      attachment,
      'id'
    );
    const customRef = composeCustomReferenceForAttachment({
      attachment,
      attachmentVersion,
      attachmentPrototypesById,
      planEntities,
      governingEntities,
    });
    const parent = computeAttachmentParent({
      attachment,
      governingEntities,
      planEntities,
    });

    // Calculate governingEntity and supportsEntities
    let governingEntity: GoverningEntityId | null = null;
    const supportsEntities: PlanEntityId[] = [];
    if (parent.type === 'governingEntity') {
      governingEntity = parent.id;
    } else if (parent.type === 'planEntity') {
      const parentEntity = getRequiredData(planEntities, parent, 'id');
      if (parentEntity.governingEntity) {
        governingEntity = parentEntity.governingEntity;
      }
      supportsEntities.push(
        ...calculateReflectiveTransitiveEntitySupport({
          planEntities,
          planEntity: parentEntity,
        })
      );
    }
    const data = typeCheckAttachmentData({
      attachment,
      attachmentVersion,
      log,
    });
    result.set(attachment.id, {
      id: attachment.id,
      customRef,
      parent,
      governingEntity,
      supportsEntities,
      data,
    });
  }

  return result;
};

/**
 * Calculate a type-safe representation of the parent of an attachment,
 * and also validate the ID against a map of allowed entities.
 */
const computeAttachmentParent = ({
  attachment,
  planEntities,
  governingEntities,
}: {
  attachment: InstanceDataOfModel<Database['attachment']>;
  /**
   * A map of plan entities, which **must** include any entity that is the
   * parent of the given attachment.
   *
   * Usually all the entities for a given plan are provided
   */
  planEntities: ValidatedPlanEntities;
  /**
   * A map of governing entities, which **must** include any governing entity
   * that is the parent of the given attachment.
   *
   * Usually all the governing entities for a given plan are provided
   */
  governingEntities: MapOfGoverningEntities;
}): AttachmentParent => {
  if (attachment.objectType === 'plan') {
    return { type: 'plan' };
  } else if (attachment.objectType === 'governingEntity') {
    const ge = getRequiredDataByValue(
      governingEntities,
      attachment,
      (a) => a.objectId
    );
    return { type: 'governingEntity', id: ge.governingEntity.id };
  } else if (attachment.objectType === 'planEntity') {
    const e = getRequiredDataByValue(
      planEntities,
      attachment,
      (a) => a.objectId
    );
    return { type: 'planEntity', id: e.id };
  }
  throw new Error(`Invalid objectType for attachment ${attachment.id}`);
};

/**
 * Type-Check the given attachment's value against its type, and return both the
 * type and the value in a type-safe manner.
 */
export const typeCheckAttachmentData = ({
  attachment,
  attachmentVersion,
  log,
}: {
  attachment: InstanceDataOfModel<Database['attachment']>;
  attachmentVersion: InstanceDataOfModel<Database['attachmentVersion']>;
  log: SharedLogContext;
}): AttachmentData => {
  const result = {
    type: attachment.type,
    value: attachmentVersion.value,
  };
  const decodedValue = ATTACHMENT_DATA.decode(result);
  if (isLeft(decodedValue)) {
    const report = ioTsErrorFormatter(decodedValue);
    for (const err of report) {
      log.info(err);
    }
    throw new Error(`Invalid attachment value for ${attachment.id}`);
  }
  return decodedValue.right;
};

export const composeCustomReferenceForAttachment = ({
  attachment,
  attachmentVersion,
  attachmentPrototypesById,
  planEntities,
  governingEntities,
}: {
  attachment: InstanceDataOfModel<Database['attachment']>;
  attachmentVersion: InstanceDataOfModel<Database['attachmentVersion']>;
  /**
   * A map of attachment prototypes, which **must** include the prototype for
   * the given attachment.
   *
   * Usually all the prototypes for a given plan are provided
   */
  attachmentPrototypesById: AnnotatedMap<
    AttachmentPrototypeId,
    InstanceDataOfModel<Database['attachmentPrototype']>
  >;
  /**
   * A map of plan entities, which **must** include any entity that is the
   * parent of the given attachment.
   *
   * Usually all the entities for a given plan are provided
   */
  planEntities: ValidatedPlanEntities;
  /**
   * A map of governing entities, which **must** include any governing entity
   * that is the parent of the given attachment.
   *
   * Usually all the governing entities for a given plan are provided
   */
  governingEntities: MapOfGoverningEntities;
}): string => {
  if (!attachment.attachmentPrototypeId) {
    throw new Error(
      `Missing attachmentPrototypeId for attachment ${attachment.id}`
    );
  }

  const prototype = getRequiredDataByValue(
    attachmentPrototypesById,
    attachment,
    (a) => a.attachmentPrototypeId
  );

  let customReference = '';
  if (attachment.objectType === 'planEntity') {
    const entity = getRequiredDataByValue(
      planEntities,
      attachment,
      (a) => a.objectId
    );
    customReference = `${entity.customRef}/`;
  } else if (attachment.objectType === 'governingEntity') {
    const ge = getRequiredDataByValue(
      governingEntities,
      attachment,
      (a) => a.objectId
    );
    customReference = `${ge.customRef}/`;
  }
  customReference += `${prototype.refCode}${attachmentVersion.customReference}`;
  return customReference;
};
