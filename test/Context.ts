import Knex from 'knex';
import { DbModels } from '../src/db';

interface IContext {
  models?: DbModels;
  conn?: Knex;
  transactions: Record<string, Knex.Transaction>;
}

const ContextProvider: IContext = {
  transactions: {},
};

export default ContextProvider;
