/**
 * Create an async function that can be called multiple times with different
 * arguments, and result in a single invocation of an async function that
 * serves all the given calls at once.
 *
 * This function takes advantage of the NodeJS single-threaded concurrency model
 * to group multiple requests together using `setImmediate`.
 */
export const createGroupableAsyncFunction = <
  Args extends readonly any[],
  Result
>(opts: {
  /**
   * This function should asynchronously return an array of results where each
   * item corresponds to the item in the `calls` array with the same index.
   *
   * An error will be thrown (and all requests will reject) when the returned
   * array has a different length to the `calls` array.
   */
  run: (calls: Args[]) => Promise<Result[]>;
}): ((...args: Args) => Promise<Result>) => {
  type Call = {
    args: Args;
    resolve: (result: Result) => void;
    reject: (err: Error) => void;
  };

  const calls = new Set<Call>();
  let nextRun: NodeJS.Immediate | null = null;

  const doNextRun = async () => {
    // Copy + clear state so any later requests will use run
    const cs = [...calls];
    calls.clear();
    nextRun = null;

    try {
      const result = await opts.run(cs.map((req) => req.args));
      if (result.length !== cs.length) {
        throw new Error(`Received unexpected number of results`);
      }
      for (let i = 0; i < cs.length; i++) {
        cs[i].resolve(result[i]);
      }
    } catch (err) {
      for (const call of cs) {
        err instanceof Error && call.reject(err);
      }
    }
  };

  return (...args: Args): Promise<Result> => {
    if (!nextRun) {
      nextRun = setImmediate(doNextRun);
    }

    return new Promise<Result>((resolve, reject) => {
      calls.add({
        args,
        resolve,
        reject,
      });
    });
  };
};
