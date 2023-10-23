import ContextProvider from '../testContext';

export const getTransaction = async () => {
  const context = ContextProvider.Instance;
  if (!context.conn) {
    throw new Error('Context connection is not defined');
  }

  const trx = await context.conn.transaction();
  context.transactions.push(trx);

  return trx;
};
