import ContextProvider from '../../Context';

describe('crud', () => {
  beforeAll(async () => {
    const context = ContextProvider;
    context.transactions['authInvite'] = await context.conn!.transaction();
    await context.models!.authTarget.create(
      {
        type: 'global',
      },
      {
        trx: context.transactions['authInvite'],
      }
    );
    await context.models!.participant.create(
      {},
      {
        trx: context.transactions['authInvite'],
      }
    );
  });

  it('create new entry', async () => {
    const context = ContextProvider;
    const trx = context.transactions['authInvite'];
    const authTarget = await context.models!.authTarget.findOne({
      where: {},
      trx,
    });
    const actor = await context.models!.participant.findOne({
      where: {},
      trx,
    });
    const created = await context.models!.authInvite.create(
      {
        target: authTarget!.id,
        email: 'testemail@test.com',
        actor: actor!.id,
        roles: ['testrole'],
      },
      {
        trx,
      }
    );
    expect(created.createdAt).toBeTruthy();
  });

  afterAll(async () => {
    const context = ContextProvider;
    const trx = context.transactions['authInvite'];
    await trx.rollback();
  });
});
