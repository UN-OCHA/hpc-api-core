import { Database } from '../db/type';
import { Config } from '../lib/config';
import { SharedLogContext, SharedLogData } from '../lib/logging';

/**
 * An object that encapsulates all the context that may need to be passed to
 * library functions for them to interact with their environment
 *
 * (e.g. interact with the database or logs)
 */
export class Context {
  public readonly config: Config;
  public readonly models: Database;
  public readonly token: string | null;
  public readonly log: SharedLogContext;

  public constructor({
    config,
    models,
    token,
    log,
  }: {
    config: Config;
    models: Database;
    token: string | null;
    log: SharedLogContext;
  }) {
    this.config = config;
    this.models = models;
    this.token = token;
    this.log = log;
  }

  /**
   * Create a new Context where the LogContext has been extended with additional
   * context
   */
  public extendLogContext = (data: Partial<SharedLogData>): Context =>
    new Context({
      config: this.config,
      models: this.models,
      token: this.token,
      log: this.log.extend(data),
    });
}
