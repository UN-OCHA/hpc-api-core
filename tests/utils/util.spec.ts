import {
  areSetsEqual,
  extendedJsonParse,
  extendedJsonStringify,
  mapToObject,
  range,
  splitIntoChunks,
  toCamelCase,
} from '../../src/util';

describe('Test utility functions', () => {
  describe('mapToObject', () => {
    it('converts a simple Map<string, number> to an object', () => {
      const map = new Map<string, number>([
        ['a', 1],
        ['b', 2],
      ]);
      const obj = mapToObject(map);
      expect(obj).toEqual({ a: 1, b: 2 });
    });

    it('converts a Map of union string keys to correctly typed object', () => {
      type TableName = 'planLocation' | 'planYear';
      type TableRecord = { id: number; planId: number };

      const records: Record<TableName, TableRecord[]> = {
        planLocation: [{ id: 1, planId: 100 }],
        planYear: [{ id: 2, planId: 200 }],
      };

      const map = new Map<TableName, TableRecord[]>([
        ['planLocation', records.planLocation],
        ['planYear', records.planYear],
      ]);

      const obj = mapToObject(map);

      expect(obj).toEqual(records);
      // Type check: obj should be `{ planLocation: TableRecord[], planYear: TableRecord[] }`
      obj satisfies Record<TableName, TableRecord[]>; // Should not produce a TypeScript error
    });

    it('returns an empty object when given an empty map', () => {
      const map = new Map<string, number>();
      const obj = mapToObject(map);
      expect(obj).toEqual({});
    });

    it('preserves non-string keys like numbers and symbols', () => {
      const sym = Symbol('key');
      const map = new Map<PropertyKey, string>([
        [1, 'one'],
        ['two', '2'],
        [sym, 'symbol'],
      ]);

      const obj = mapToObject(map);
      expect(obj[1]).toBe('one');
      expect(obj['two']).toBe('2');
      expect(obj[sym]).toBe('symbol');
    });
  });

  describe('toCamelCase', () => {
    it('should convert string to camel case', () => {
      expect(toCamelCase('')).toBe('');
      expect(toCamelCase('Reached')).toBe('reached');
      expect(toCamelCase('Cumulative reach')).toBe('cumulativeReach');
      expect(toCamelCase('Double  space')).toBe('doubleSpace');
      expect(toCamelCase('  leading space')).toBe('leadingSpace');
      expect(toCamelCase('trailing space  ')).toBe('trailingSpace');
      expect(toCamelCase('  both ends  ')).toBe('bothEnds');
      expect(toCamelCase('with three words')).toBe('withThreeWords');
      expect(toCamelCase('Mixed CASE')).toBe('mixedCase');
      expect(toCamelCase('Another Test CASE')).toBe('anotherTestCase');
      expect(toCamelCase('version 1.0')).toBe('version1.0');
      expect(toCamelCase('2fast 2furious')).toBe('2fast2furious');
    });
  });

  describe('range', () => {
    it('should generate a sequence starting from 0 by default', () => {
      expect(range(5)).toEqual([0, 1, 2, 3, 4]);
    });

    it('should generate a sequence starting from a custom value', () => {
      expect(range(5, 10)).toEqual([10, 11, 12, 13, 14]);
    });

    it('should return an empty array when size is 0', () => {
      expect(range(0)).toEqual([]);
    });

    it('should handle size of 1', () => {
      expect(range(1)).toEqual([0]);
      expect(range(1, 5)).toEqual([5]);
    });

    it('should handle negative start values', () => {
      expect(range(5, -3)).toEqual([-3, -2, -1, 0, 1]);
    });
  });

  describe('splitIntoChunks', () => {
    it('should split an array into equal-sized chunks', () => {
      expect(splitIntoChunks(range(6, 1), 2)).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });

    it('should handle arrays where the last chunk is smaller', () => {
      expect(splitIntoChunks(range(5, 1), 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(splitIntoChunks(range(17, 1), 5)).toEqual([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17],
      ]);
    });

    it('should return an empty array when input is empty', () => {
      expect(splitIntoChunks([], 3)).toEqual([]);
    });

    it('should handle chunk size larger than the array length', () => {
      expect(splitIntoChunks(range(3, 1), 10)).toEqual([[1, 2, 3]]);
    });

    it('should handle chunk size of 1', () => {
      expect(splitIntoChunks(range(3, 1), 1)).toEqual([[1], [2], [3]]);
    });

    it('should handle chunk size equal to array length', () => {
      expect(splitIntoChunks(range(4, 1), 4)).toEqual([[1, 2, 3, 4]]);
    });

    it('should work with an array of strings', () => {
      expect(splitIntoChunks(['a', 'b', 'c', 'd'], 2)).toEqual([
        ['a', 'b'],
        ['c', 'd'],
      ]);
    });
  });

  describe('areSetsEqual', () => {
    it('should return true for two empty sets', () => {
      expect(areSetsEqual(new Set(), new Set())).toBe(true);
    });

    it('should return true for sets with same elements in different order', () => {
      expect(areSetsEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))).toBe(true);
    });

    it('should return false for sets with different elements', () => {
      expect(areSetsEqual(new Set([1, 2]), new Set([2, 3]))).toBe(false);
    });

    it('should return false if sets have different sizes', () => {
      expect(areSetsEqual(new Set([1]), new Set([1, 2]))).toBe(false);
    });

    it('should return false if only one set is empty', () => {
      expect(areSetsEqual(new Set(), new Set([1]))).toBe(false);
    });

    it('should return true for sets with same string elements', () => {
      expect(areSetsEqual(new Set(['a', 'b']), new Set(['b', 'a']))).toBe(true);
    });

    it('should return true for sets with same object references', () => {
      const obj1 = { x: 1 };
      const obj2 = { y: 2 };
      const setA = new Set([obj1, obj2]);
      const setB = new Set([obj2, obj1]);
      expect(areSetsEqual(setA, setB)).toBe(true);
    });

    it('should return false for sets with different object references', () => {
      const setA = new Set([{ x: 1 }]);
      const setB = new Set([{ x: 1 }]);
      expect(areSetsEqual(setA, setB)).toBe(false); // Different object identities
    });
  });

  describe('extendedJsonStringify', () => {
    it('should serialize a Map', () => {
      const input = new Map([
        ['a', 1],
        ['b', 2],
      ]);

      const json = extendedJsonStringify(input);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual({
        __serialized_type__: 'Map',
        value: [
          ['a', 1],
          ['b', 2],
        ],
      });
    });

    it('should serialize a Set', () => {
      const input = new Set([1, 2, 2, 3]);
      const json = extendedJsonStringify(input);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual({
        __serialized_type__: 'Set',
        value: [1, 2, 3],
      });
    });

    it('should serialize a nested structure with Map and Set', () => {
      const input = {
        name: 'example',
        data: new Map([['key', new Set([1, 2])]]),
      };

      const json = extendedJsonStringify(input);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual({
        name: 'example',
        data: {
          __serialized_type__: 'Map',
          value: [
            [
              'key',
              {
                __serialized_type__: 'Set',
                value: [1, 2],
              },
            ],
          ],
        },
      });
    });

    it('should serialize a regular object without changes', () => {
      const input = { key: 'value', num: 42 };
      const json = extendedJsonStringify(input);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual(input);
    });
  });

  describe('extendedJsonParse', () => {
    describe('extendedJsonParse with plain JSON.stringify()', () => {
      it('should deserialize a serialized Map', () => {
        const serialized = JSON.stringify({
          __serialized_type__: 'Map',
          value: [['x', 10]],
        });

        const result = extendedJsonParse(serialized);

        expect(result).toBeInstanceOf(Map);
        expect((result as Map<string, number>).get('x')).toBe(10);
      });

      it('should deserialize a serialized Set', () => {
        const serialized = JSON.stringify({
          __serialized_type__: 'Set',
          value: [1, 2, 3],
        });

        const result = extendedJsonParse(serialized);

        expect(result).toBeInstanceOf(Set);
        expect([...(result as Set<number>)]).toEqual([1, 2, 3]);
      });

      it('should deserialize a nested structure with Map and Set', () => {
        const input = {
          name: 'nested',
          data: {
            __serialized_type__: 'Map',
            value: [
              [
                'k',
                {
                  __serialized_type__: 'Set',
                  value: [5, 6],
                },
              ],
            ],
          },
        };

        const serialized = JSON.stringify(input);
        const result = extendedJsonParse(serialized) as any;

        expect(result.name).toBe('nested');
        expect(result.data).toBeInstanceOf(Map);

        const nestedSet = result.data.get('k');
        expect(nestedSet).toBeInstanceOf(Set);
        expect([...nestedSet]).toEqual([5, 6]);
      });

      it('should parse a regular JSON string without changes', () => {
        const input = { x: 100, y: false };
        const json = JSON.stringify(input);
        const result = extendedJsonParse(json);

        expect(result).toEqual(input);
      });
    });

    describe('extendedJsonParse with extendedJsonStringify', () => {
      it('should correctly round-trip a Map', () => {
        const input = new Map<string, string | number>([
          ['username', 'alice'],
          ['id', 42],
        ]);

        const json = extendedJsonStringify(input);
        const result = extendedJsonParse(json);

        expect(result).toBeInstanceOf(Map);
        expect((result as Map<string, unknown>).get('username')).toBe('alice');
        expect((result as Map<string, unknown>).get('id')).toBe(42);
      });

      it('should correctly round-trip a Set', () => {
        const input = new Set(['read', 'write', 'delete']);

        const json = extendedJsonStringify(input);
        const result = extendedJsonParse(json) as Set<string>;

        expect(result).toBeInstanceOf(Set);
        expect(areSetsEqual(input, result)).toBe(true);
      });

      it('should correctly round-trip an object containing Map and Set', () => {
        const input = {
          roles: new Set(['admin', 'editor']),
          metadata: new Map<string, string | number>([
            ['createdBy', 'system'],
            ['version', 3],
          ]),
        };

        const json = extendedJsonStringify(input);
        const result = extendedJsonParse(json);

        expect(typeof result).toBe('object');
        expect(result).not.toBeNull();

        const typedResult = result as {
          roles: Set<string>;
          metadata: Map<string, unknown>;
        };

        expect(typedResult.roles).toBeInstanceOf(Set);
        expect(typedResult.metadata).toBeInstanceOf(Map);
        expect(areSetsEqual(typedResult.roles, input.roles)).toBe(true);
        expect(typedResult.metadata.get('createdBy')).toBe('system');
        expect(typedResult.metadata.get('version')).toBe(3);
      });

      it('should correctly round-trip a plain object without Map or Set', () => {
        const input = {
          status: 'active',
          retries: 5,
        };

        const json = extendedJsonStringify(input);
        const result = extendedJsonParse(json);

        expect(result).toEqual(input);
      });
    });
  });
});
