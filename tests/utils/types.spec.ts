import { getTableColumns } from '../../src/util/types';
import ContextProvider from '../testContext';

const context = ContextProvider.Instance;

describe("Test 'getTableColumns' function", () => {
  it('should return the columns of a table', () => {
    const columns = getTableColumns(context.models.emergency);

    expect(columns).toBeDefined();
    expect(columns).toBeInstanceOf(Array);
    const expectedColumns = [
      'id',
      'name',
      'date',
      'restricted',
      'active',
      'createdAt',
      'updatedAt',
      'description',
      'glideId',
      'levelThree',
    ];
    for (const column of expectedColumns) {
      expect(columns).toContain(column);
    }
  });
  it('should return an empty array if the table has no columns', () => {
    const columns = getTableColumns({ _internals: { fields: {} } });
    expect(columns).toBeDefined();
    expect(columns).toBeInstanceOf(Array);
    expect(columns).toHaveLength(0);
  });
});
