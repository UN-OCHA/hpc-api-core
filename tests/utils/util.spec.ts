import { range, splitIntoChunks, toCamelCase } from '../../src/util';

describe('Test utility functions', () => {
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
});
