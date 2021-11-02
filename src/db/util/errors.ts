const CONCURRENT_MODIFICATION_ERROR = Symbol('ConcurrentModificationError');
const DATA_VALIDATION_ERROR = Symbol('DataValidationError');

export class ConcurrentModificationError extends Error {
  public readonly _kind = CONCURRENT_MODIFICATION_ERROR;

  public constructor(message: string) {
    super(`ConcurrentModificationError: ${message}`);
    this.name = 'ConcurrentModificationError';
  }
}

export const isConcurrentModificationError = (
  err: unknown
): err is ConcurrentModificationError =>
  err instanceof Error &&
  (err as ConcurrentModificationError)._kind === CONCURRENT_MODIFICATION_ERROR;

export class DataValidationError extends Error {
  public readonly _kind = DATA_VALIDATION_ERROR;
  public readonly data: unknown;

  constructor({
    errors,
    identifier,
    data,
  }: {
    errors: string[];
    identifier: string;
    data: unknown;
  }) {
    super(`Invalid data for ${identifier}: ${errors.join(', ')}`);
    this.name = 'DataValidationError';
    this.data = data;
  }
}

export const isDataValidationError = (
  err: unknown
): err is DataValidationError =>
  err instanceof Error &&
  (err as DataValidationError)._kind === DATA_VALIDATION_ERROR;
