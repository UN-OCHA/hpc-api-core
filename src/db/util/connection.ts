import * as t from 'io-ts';
import Knex from 'knex';
import { genericValidator } from './validation';

const CONFIG = t.type({
  db: t.type({
    poolMin: t.number,
    poolMax: t.number,
    connection: t.string,
    poolIdle: t.number,
  }),
});

/**
 * Initialize a new Postgres provider
 */
export async function createDbConnetion(config: t.TypeOf<typeof CONFIG>) {
  const safeConfig = genericValidator(CONFIG, config);
  const knex = Knex({
    client: 'pg',
    connection: safeConfig.db.connection,
    pool: {
      min: safeConfig.db.poolMin,
      max: safeConfig.db.poolMax,
      idleTimeoutMillis: safeConfig.db.poolIdle,
    },
    acquireConnectionTimeout: 2000,
  });

  // Verify the connection before proceeding
  try {
    await knex.raw('SELECT now()');

    return knex;
  } catch (error) {
    throw new Error(
      'Unable to connect to Postgres via Knex. Ensure a valid connection.'
    );
  }
}

export default { createDbConnetion };
