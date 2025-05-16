import { isRight } from 'fp-ts/Either';
import * as t from 'io-ts';
import { getTableColumns, map } from '../../src/util/types';
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

describe('map codec', () => {
  const numberToStringMap = map(t.number, t.string);

  it('should decode a valid Map<number, string>', () => {
    const input = new Map<number, string>([
      [1, 'a'],
      [2, 'b'],
    ]);

    const result = numberToStringMap.decode(input);
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.right instanceof Map).toBe(true);
      expect(result.right.get(1)).toBe('a');
    }
  });

  it('should fail if a key is of the wrong type', () => {
    const input = new Map<string, string>([['wrong-key', 'value']]);

    const result = numberToStringMap.decode(input);
    expect(isRight(result)).toBe(false);
    if (!isRight(result)) {
      expect(result.left[0].message).toBe(
        `Invalid type for key: 'wrong-key'. Error: Invalid value "wrong-key" supplied to : Map<number, string>`
      );
    }
  });

  it('should fail if a value is of the wrong type', () => {
    const input = new Map<number, unknown>([
      [1, 'a'],
      [2, 999], // Invalid value
    ]);

    const result = numberToStringMap.decode(input);
    expect(isRight(result)).toBe(false);
    if (!isRight(result)) {
      expect(result.left[0].message).toBe(
        "Invalid type for value at key: '2'. Error: Invalid value 999 supplied to : Map<number, string>"
      );
    }
  });

  it('should fail if input is not a Map', () => {
    const input = { a: 1 };

    const result = numberToStringMap.decode(input);
    expect(isRight(result)).toBe(false);
  });

  it('should use the provided codec name in error messages', () => {
    const CustomMap = map(t.string, t.boolean, 'CustomMap');
    const input = new Map<unknown, unknown>([[123, true]]);

    const result = CustomMap.decode(input);
    expect(isRight(result)).toBe(false);
    if (!isRight(result)) {
      expect(
        result.left[0].context.some((c) => c.type.name === 'CustomMap')
      ).toBe(true);
      expect(result.left[0].message).toBe(
        "Invalid type for key: '123'. Error: Invalid value 123 supplied to : CustomMap"
      );
    }
  });

  it('should work as a type guard', () => {
    expect(
      numberToStringMap.is(
        new Map([
          [1, 'a'],
          [2, 'b'],
        ])
      )
    ).toBe(true);
    expect(
      numberToStringMap.is(
        new Map([
          [1, 1],
          [2, 2],
        ])
      )
    ).toBe(false);
  });
});
