import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, truncateText, formatNumber } from '../utils/formatters';

describe('formatPrice', () => {
    it('formats price correctly', () => {
        expect(formatPrice(9.99)).toBe('$9.99');
        expect(formatPrice(1000)).toBe('$1,000.00');
    });

    it('returns $0.00 for invalid input', () => {
        expect(formatPrice(NaN)).toBe('$0.00');
        expect(formatPrice('abc')).toBe('$0.00');
    });
});

describe('formatDate', () => {
    it('formats date correctly', () => {
        expect(formatDate('2025-01-15')).toContain('January');
        expect(formatDate('2025-01-15')).toContain('2025');
    });

    it('returns empty string for invalid input', () => {
        expect(formatDate('')).toBe('');
        expect(formatDate(null)).toBe('');
    });
});

describe('truncateText', () => {
    it('truncates long text', () => {
        const result = truncateText('This is a very long text that should be truncated', 20);
        expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
        expect(result.endsWith('...')).toBe(true);
    });

    it('does not truncate short text', () => {
        expect(truncateText('Short', 100)).toBe('Short');
    });

    it('handles empty/null', () => {
        expect(truncateText('')).toBe('');
        expect(truncateText(null)).toBe('');
    });
});

describe('formatNumber', () => {
    it('formats thousands', () => {
        expect(formatNumber(1000)).toBe('1,000');
        expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('handles invalid', () => {
        expect(formatNumber(NaN)).toBe('0');
    });
});