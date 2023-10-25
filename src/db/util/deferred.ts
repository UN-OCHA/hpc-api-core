import { createGroupableAsyncFunction } from '../../util/async';

/**
 * A model that allows for fetching of multiple items by their ID at once
 */
interface DeferrableModel<ID, Instance extends { id: ID }> {
  getAll: (ids: ID[]) => Promise<Map<ID, Instance>>;
}

/**
 * A utility that allows for grouping individual database get requests into a
 * single query.
 *
 * See `createDeferredFetcher`
 */
export type DeferredFetcher<IDType, Instance> = {
  get: (id: IDType) => Promise<Instance | null>;
};

/**
 * Determine the type of a deferred fetcher for a particular versioned model.
 *
 * This is useful for specifying the parameters of a function that needs a
 * deferred fetcher of a particular table
 */
export type DeferredFetcherForModel<M extends DeferrableModel<any, any>> =
  M extends DeferrableModel<infer IDType, infer Instance>
    ? DeferredFetcher<IDType, Instance>
    : never;

/**
 * Create a DeferredFetcher for a specific VersionedModel.
 *
 * This function uses `createGroupableAsyncFunction`
 */
export const createDeferredFetcher = <
  IDType extends number,
  Instance extends { id: IDType },
>(
  model: DeferrableModel<IDType, Instance>
): DeferredFetcher<IDType, Instance> => {
  const get = createGroupableAsyncFunction({
    run: async (calls: [IDType][]): Promise<(Instance | null)[]> => {
      const ids = [...new Set(calls.map(([id]) => id))];
      const result = await model.getAll(ids);
      return calls.map(([id]) => result.get(id) || null);
    },
  });

  return {
    get,
  };
};
