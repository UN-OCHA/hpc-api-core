const CONCURRENT_MODIFICATION_ERROR = Symbol('ConcurrentModificationError');

export class ConcurrentModificationError extends Error {
  public readonly _kind = CONCURRENT_MODIFICATION_ERROR;

  public constructor(message: string) {
    super(`ConcurrentModificationError: ${message}`);
  }
}

export const isConcurrentModificationError = (
  err: unknown
): err is ConcurrentModificationError =>
  err instanceof Error &&
  (err as ConcurrentModificationError)._kind === CONCURRENT_MODIFICATION_ERROR;
