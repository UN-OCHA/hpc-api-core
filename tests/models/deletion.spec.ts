import ContextProvider from '../testContext';

const context = ContextProvider.Instance;

describe('Deletion', () => {
  it('should hard delete a record', async () => {
    const { id } = await context.models.currency.create({
      code: 'TST',
    });

    expect(await context.models.currency.get(id)).not.toBeNull();
    expect(
      await context.models.currency.destroy({
        where: {
          id,
        },
      })
    ).toBe(1);
    expect(await context.models.currency.get(id)).toBeNull();
    expect(
      await context.models.currency.findOne({
        where: { id },
        includeDeleted: true,
      })
    ).toBeNull();
  });

  it('should soft delete a record', async () => {
    const { id } = await context.models.lookup.create({
      input: 'input',
      inputField: 'DONOR',
      output: 'output',
      outputField: 'LOCATION',
    });

    expect(await context.models.lookup.get(id)).not.toBeNull();
    expect(
      await context.models.lookup.destroy({
        where: {
          id,
        },
      })
    ).toBe(1);
    expect(await context.models.lookup.get(id)).toBeNull();
    expect(
      await context.models.lookup.findOne({
        where: { id },
        includeDeleted: true,
      })
    ).not.toBeNull();
  });

  it('should hard delete a record with forceHardDeletion', async () => {
    const { id } = await context.models.lookup.create({
      input: 'input',
      inputField: 'DONOR',
      output: 'output',
      outputField: 'LOCATION',
    });

    expect(await context.models.lookup.get(id)).not.toBeNull();
    expect(
      await context.models.lookup.destroy({
        where: { id },
        forceHardDeletion: true,
      })
    ).toBe(1);
    expect(await context.models.lookup.get(id)).toBeNull();
    expect(
      await context.models.lookup.findOne({
        where: { id },
        includeDeleted: true,
      })
    ).toBeNull();
  });
});
