/**
 * This interface represents any data that hpc-api-core may want to add to an
 * existing log context to help with logging.
 *
 * Any mode specific data type to use with LogMethod and LogContext should
 * extend this interface.
 *
 * We have to specify the exact type of JSON data that we expect to log because
 * different log entries with different types for JSON properties will cause our
 * logging system to drop log entries.
 */
export type SharedLogData = {
  /**
   * Placeholder property to ensure that SharedLogData is not an empty object
   *
   * Without this, or other properties, any object is assignable to
   * SharedLogData, which will make it harder to detect when invalid data
   */
  readonly _sharedLogData?: null;
  // TODO: add fields here when needed by the library for logging information
};

export type LogMethod<Data extends SharedLogData> = (
  message: string,
  opts?: {
    data?: Partial<Data>;
    error?: Error;
  }
) => void;

export interface LogContext<Data extends SharedLogData> {
  extend: (data: Partial<Data>) => LogContext<Data>;
  error: LogMethod<Data>;
  warn: LogMethod<Data>;
  info: LogMethod<Data>;
  debug: LogMethod<Data>;
}

/**
 * A LogContext that can be extended with data that conforms to the
 * SharedLogData interface
 */
export type SharedLogContext = LogContext<SharedLogData>;
