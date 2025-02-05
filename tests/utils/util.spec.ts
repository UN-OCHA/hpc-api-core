import { toCamelCase } from '../../src/util';

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
});
