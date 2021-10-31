export const isDefined = <T>(v: T | null | undefined): v is T =>
  v !== null && v !== undefined;

/**
 * Strict version of Object.entries() that has a more useful key type,
 * and filters out entries where the value is undefined
 */
export const definedEntries = <K extends string, V>(
  o: {
    [key in K]?: V;
  }
): Array<[K, V]> =>
  [...(Object.entries(o) as [K, V][])].filter(([_k, v]) => isDefined(v));

export const delay = (ms: number): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve, ms));
export type RecursivePartial<T> = T extends number
  ? T
  : {
      [P in keyof T]?: RecursivePartial<T[P]>;
    };

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Return an instance of the given value where all of its readonly
 * properties are writable
 */
export const writable = <T>(value: T): Writeable<T> => value as Writeable<T>;

/**
 * Return a function that can be given to `Array.sort()` to sort an array
 * of items based on the given list of properties.
 *
 * A property in this case either be the name of a property for items of the
 * expected type, or a function that can be given the item and return a value
 * that should be compared against.
 */
export const sortBy =
  <T>(
    ...properties: Array<
      keyof T | ((v: T) => number | string | undefined | null | boolean)
    >
  ) =>
  (a: T, b: T): number => {
    const getDiff = (pa: unknown, pb: unknown) => {
      if (typeof pa === 'string' && typeof pb === 'string') {
        return pa.localeCompare(pb);
      } else if (typeof pa === 'number' && typeof pb === 'number') {
        return pa - pb;
      }
      // Just do a boolean compare (truthy first)
      return (pa ? 0 : 1) - (pb ? 0 : 1);
    };

    for (const prop of properties) {
      const diff =
        typeof prop === 'string'
          ? getDiff(a[prop], b[prop])
          : typeof prop === 'function'
          ? getDiff(prop(a), prop(b))
          : 0;
      if (diff !== 0) {
        return diff;
      }
    }

    return 0;
  };

/**
 * Obtain the type parameter of a promise type
 */
export type PromiseType<P extends Promise<any>> = P extends Promise<infer V>
  ? V
  : never;

/**
 * Take a collection of objects,
 * and group them by one of their properties
 */
export const groupObjectsByProperty = <I, P extends keyof I>(
  objects: Iterable<I>,
  property: P
): Map<I[P], Set<I>> => {
  const result = new Map<I[P], Set<I>>();
  for (const obj of objects) {
    let group = result.get(obj[property]);
    if (!group) {
      result.set(obj[property], (group = new Set()));
    }
    group.add(obj);
  }
  return result;
};

/**
 * Take a collection of objects,
 * and create a map of them, using aparticular property as the key
 */
export const organizeObjectsByUniqueProperty = <I, P extends keyof I>(
  objects: Iterable<I>,
  property: P
): Map<I[P], I> => {
  const result = new Map<I[P], I>();
  for (const obj of objects) {
    const existing = result.get(obj[property]);
    if (existing) {
      throw new Error(`Duplicate property value: ${obj[property]}`);
    }
    result.set(obj[property], obj);
  }
  return result;
};

/**
 * Return a new object with the given map function applies to all values
 */
export const mapObjectEntries = <K extends string | symbol, V1, V2>(
  obj: { [key in K]: V1 },
  map: (v: V1) => V2
): { [key in K]: V2 } => {
  return Object.fromEntries(
    (Object.entries<V1>(obj) as [K, V1][]).map(([k, v]) => [k, map(v)])
  ) as { [key in K]: V2 };
};

export type MapValue<M extends Map<any, any>> = M extends Map<any, infer V>
  ? V
  : unknown;

export const getOrCreate = <K, V>(map: Map<K, V>, k: K, val: () => V): V => {
  let v = map.get(k);

  if (v === undefined) {
    v = val();
    map.set(k, v);
  }

  return v;
};

/**
 * JSON type definition
 */
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JSONArray extends Array<JSONValue> {}
