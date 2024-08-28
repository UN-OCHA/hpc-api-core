import type { Table } from '.';
import { organizeObjectsByUniqueValue, type AnnotatedMap } from '../util';
import type { InstanceDataOfModel, Model } from './util/raw-model';
import type {
  InstanceOfVersionedModel,
  VersionedModel,
} from './util/versioned-model';

/**
 * Generic type that can be used to obtain the type of an instance of either a
 * standard table, or a versioned table.
 */
type InstanceOf<T extends Table> =
  T extends Model<any>
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
  T extends Table,
  P extends keyof InstanceOf<T>,
>(
  table: T,
  fetch: (tbl: T) => Promise<Iterable<InstanceOf<T>>>,
  property: P
): Promise<AnnotatedMap<Exclude<InstanceOf<T>[P], null>, InstanceOf<T>>> => {
  return findAndOrganizeObjectsByUniqueValue(table, fetch, (item) => {
    const val = item[property];
    if (val === null) {
      throw new Error(
        `Unexpected null value in ${property.toString()} for ${item}`
      );
    }
    return val as Exclude<InstanceOf<T>[P], null>;
  });
};

/**
 * Fetch a number of items of a particular type from the database,
 * and organize them into an AnnotatedMap by a unique value.
 */
export const findAndOrganizeObjectsByUniqueValue = async <T extends Table, V>(
  table: T,
  fetch: (tbl: T) => Promise<Iterable<InstanceOf<T>>>,
  getValue: (i: InstanceOf<T>) => Exclude<V, null>
): Promise<AnnotatedMap<Exclude<V, null>, InstanceOf<T>>> => {
  const values = await fetch(table);
  const tableName =
    table._internals.type === 'single-table'
      ? table._internals.tableName
      : table._internals.root.tableName;
  return organizeObjectsByUniqueValue(values, getValue, tableName);
};
