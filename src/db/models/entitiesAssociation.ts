import * as t from 'io-ts';
import { defineSequelizeModel } from '../util/sequelize-model';
import { GOVERNING_ENTITY_ID } from './governingEntity';
import { PLAN_ENTITY_ID } from './planEntity';

export default defineSequelizeModel({
  tableName: 'entitiesAssociation',
  fields: {
    required: {
      parentId: { kind: 'branded-integer', brand: GOVERNING_ENTITY_ID },
      parentType: { kind: 'checked', type: t.literal('governingEntity') },
      childId: { kind: 'branded-integer', brand: PLAN_ENTITY_ID },
      childType: { kind: 'checked', type: t.literal('planEntity') },
    },
  },
  softDeletionEnabled: false,
});
