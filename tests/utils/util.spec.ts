import { toCamelCase } from '../../src/util';

describe('Test utility functions', () => {
  it('should convert string to camel case', () => {
    expect(toCamelCase('Reached')).toBe('reached');
    expect(toCamelCase('Cumulative reach')).toBe('cumulativeReach');
    expect(toCamelCase('Double  space')).toBe('doubleSpace');
    expect(toCamelCase('with three words')).toBe('withThreeWords');
  });
});
