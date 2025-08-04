import type { Database } from '../../db';
import type { CategoryId } from '../../db/models/category';
import type { OrganizationId } from '../../db/models/organization';
import type { InstanceDataOfModel } from '../../db/util/raw-model';
import {
  groupObjectsByProperty,
  organizeObjectsByUniqueProperty,
} from '../../util';

type OrganizationInfo = InstanceDataOfModel<Database['organization']> & {
  type: string;
  subType: string;
  level: string;
};

/**
 * Fetches organizations with requested IDs,
 * plus their type, subtype and level
 */
export const getOrganizationsInfo = async (
  database: Database,
  organizationIds: Iterable<OrganizationId>
): Promise<OrganizationInfo[]> => {
  const organizations = await database.organization.find({
    where: {
      id: { [database.Op.IN]: organizationIds },
      active: true,
    },
  });

  const categoriesByOrganizationId = groupObjectsByProperty(
    await database.categoryRef.find({
      where: {
        objectType: 'organization',
        objectID: { [database.Op.IN]: organizations.map((o) => o.id) },
      },
    }),
    'objectID'
  );

  const categoriesById = organizeObjectsByUniqueProperty(
    await database.category.find({
      where: {
        id: {
          [database.Op.IN]: categoriesByOrganizationId
            .values()
            .flatMap((categories) => categories.map((cr) => cr.categoryID)),
        },
        group: { [database.Op.IN]: ['organizationType', 'organizationLevel'] },
      },
    }),
    'id'
  );

  return organizations.map((o) => {
    const organizationCategories = categoriesByOrganizationId.get(o.id);

    let type = '';
    let subType = '';
    let level = '';

    for (const organizationCategory of organizationCategories ?? []) {
      const category = categoriesById.get(organizationCategory.categoryID);

      if (category?.group === 'organizationType') {
        if (category.parentID) {
          subType = category.name;
        } else {
          type = category.name;
        }
      } else if (
        category?.group === 'organizationLevel' &&
        !category.parentID
      ) {
        level = category.name;
      }
    }

    return {
      ...o,
      type,
      subType,
      level,
    };
  });
};

export const getOrganizationTypes = async (database: Database) => {
  const categories = await database.category.find({
    where: {
      group: 'organizationType',
    },
  });

  const categoriesById = organizeObjectsByUniqueProperty(categories, 'id');

  return categories
    .filter(
      (c): c is typeof c & { parentID: CategoryId } => c.parentID !== null
    )
    .map((c) => {
      const parent = categoriesById.get(c.parentID);
      if (!parent) {
        // This should never happen
        throw new Error(`Parent category ${c.parentID} not found`);
      }
      return {
        organizationType: parent.name,
        organizationSubType: c.name,
      };
    });
};
