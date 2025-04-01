import { range, toCamelCase } from '../../src/util';

describe('Test utility functions', () => {
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
});
