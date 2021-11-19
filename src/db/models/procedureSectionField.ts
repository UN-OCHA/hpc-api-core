import { defineSequelizeModel } from '../util/sequelize-model';
import { CONDITION_FIELD_ID } from './conditionField';
import { PROCEDURE_SECTION_ID } from './procedureSection';

export default defineSequelizeModel({
  tableName: 'procedureSectionField',
  fields: {
    required: {
      procedureSectionId: {
        kind: 'branded-integer',
        brand: PROCEDURE_SECTION_ID,
      },
      conditionFieldId: { kind: 'branded-integer', brand: CONDITION_FIELD_ID },
    },
  },
  softDeletionEnabled: false,
});
