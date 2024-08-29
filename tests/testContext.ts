import type { Knex } from 'knex';
import v4Models, { type Database } from '../src/db';
import { createDbConnection } from './utils/connection';

interface IContext {
  models: Database;
  conn: Knex;
  transactions: Knex.Transaction[];
}

export default class ContextProvider implements IContext {
  private static _instance: ContextProvider;

  models: Database;
  conn: Knex;
  transactions: Knex.Transaction[];

  private constructor() {
    this.models = {} as Database;
    this.transactions = [];
    this.conn = {} as Knex;
  }

  public static get Instance(): ContextProvider {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new ContextProvider();
    return this._instance;
  }

  public async setUpContext(): Promise<void> {
    const connection = await this.createDbTestConnection();
    this.conn = connection;
    this.models = v4Models(this.conn);
  }

  private async createDbTestConnection(): Promise<Knex<any, unknown[]>> {
    return await createDbConnection({
      host: 'localhost',
      port: 6432,
      user: 'postgres',
      database: 'hpc-test',
    });
  }
}
