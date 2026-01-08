import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber, getInitials } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('formats date in short format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date, 'short');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
    });

    it('formats date in long format', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date, 'long');
      expect(formatted).toContain('January');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousand separators', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1000)).toBe('1,000');
    });
  });

  describe('getInitials', () => {
    it('extracts initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Jane Mary Smith')).toBe('JM');
      expect(getInitials('Single')).toBe('SI');
    });
  });
});
