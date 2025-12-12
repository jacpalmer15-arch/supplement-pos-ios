import { formatCurrency } from '../lib/utils';

describe('Currency Formatting', () => {
  test('formats cents to dollars correctly', () => {
    expect(formatCurrency(2999)).toBe('$29.99');
    expect(formatCurrency(1500)).toBe('$15.00');
    expect(formatCurrency(100)).toBe('$1.00');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(50)).toBe('$0.50');
  });

  test('handles large amounts correctly', () => {
    expect(formatCurrency(999999)).toBe('$9,999.99');
    expect(formatCurrency(1000000)).toBe('$10,000.00');
  });
});