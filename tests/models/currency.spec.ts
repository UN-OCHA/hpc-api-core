import ContextProvider from '../testContext';
import { getTransaction } from '../utils';

const context = ContextProvider.Instance;

describe('Ensure creation of a currency', () => {
  it('should be able to create a currency', async () => {
    const trx = await getTransaction();

    const currency = await context.models.currency.create(
      {
        code: 'TST',
      },
      { trx }
    );

    expect(currency).toBeDefined();
    expect(currency.id).toBeDefined();
    expect(currency.code).toEqual('TST');
  });
});
