import ContextProvider from './Context';
import { createDbConnetion } from '../src/db/util/connection';
import dbModels from '../src/db';

beforeAll(async () => {
  const context = ContextProvider;
  context.conn = await createDbConnetion({
    db: {
      poolMin: 1,
      poolMax: 1,
      poolIdle: 1,
      connection: process.env.POSTGRES_CONNECTION_STRING!,
    },
  });
  context.models = dbModels(context.conn);
});

afterAll(async () => {
  const context = ContextProvider;
  await context.conn!.destroy();
});
