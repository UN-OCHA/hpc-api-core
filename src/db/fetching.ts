import { AnnotatedMap, organizeObjectsByUniqueValue } from '../util';
import { Database } from './type';
import { InstanceDataOfModel, Model } from './util/raw-model';
import {
  InstanceOfVersionedModel,
  VersionedModel,
} from './util/versioned-model';

/**
 * Generic type that can be used to obtain the type of an instance of either a
 * standard table, or a versioned table.
 */
type InstanceOf<T extends Database[keyof Database]> = T extends Model<any>
  ? InstanceDataOfModel<T>
  : T extends VersionedModel<any, any, any>
  ? InstanceOfVersionedModel<T>
  : never;

/**
 * Fetch a number of items of a particular type from the database,
 * and organize them into an AnnotatedMap by a unique property.
 *
 * The property selected must non-null for every instance retrieved from the
 * database, otherwise an error will be thrown
 */
export const findAndOrganizeObjectsByUniqueProperty = <
  Table extends Database[keyof Database],
  P extends keyof InstanceOf<Table>
>(
  table: Table,
  fetch: (tbl: Table) => Promise<Iterable<InstanceOf<Table>>>,
  property: P
): Promise<
  AnnotatedMap<Exclude<InstanceOf<Table>[P], null>, InstanceOf<Table>>
> => {
  return findAndOrganizeObjectsByUniqueValue(table, fetch, (item) => {
    const val = item[property];
    if (val === null) {
      throw new Error(`Unexpected null value in ${property} for ${item}`);
    }
    return val as Exclude<InstanceOf<Table>[P], null>;
  });
};

/**
 * Fetch a number of items of a particular type from the database,
 * and organize them into an AnnotatedMap by a unique value.
 */
export const findAndOrganizeObjectsByUniqueValue = async <
  Table extends Database[keyof Database],
  V
>(
  table: Table,
  fetch: (tbl: Table) => Promise<Iterable<InstanceOf<Table>>>,
  getValue: (i: InstanceOf<Table>) => Exclude<V, null>
): Promise<AnnotatedMap<Exclude<V, null>, InstanceOf<Table>>> => {
  const values = await fetch(table);
  const tableName =
    table._internals.type === 'single-table'
      ? table._internals.tableName
      : table._internals.root.tableName;
  return organizeObjectsByUniqueValue(values, getValue, tableName);
};
