import ContextProvider from './testContext';

beforeAll(async () => {
  await ContextProvider.Instance.setUpContext();
});

afterEach(async () => {
  const context = ContextProvider.Instance;

  for (const trx of context.transactions.filter((trx) => !trx.isCompleted())) {
    await trx.rollback();
  }
});
