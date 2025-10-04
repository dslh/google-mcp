import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validateString,
  validateNumber,
  validateEmail,
  validateEnum,
  validateDateTime,
  validateFileId,
  validateDocumentId,
  validateCalendarId,
} from '../../src/utils/validators.js';

describe('validators', () => {
  describe('validateRequired', () => {
    it('should return value if it is defined', () => {
      expect(validateRequired('test', 'field')).toBe('test');
      expect(validateRequired(123, 'field')).toBe(123);
      expect(validateRequired(false, 'field')).toBe(false);
    });

    it('should throw error if value is undefined', () => {
      expect(() => validateRequired(undefined, 'field')).toThrow('field is required');
    });

    it('should throw error if value is null', () => {
      expect(() => validateRequired(null, 'field')).toThrow('field is required');
    });
  });

  describe('validateString', () => {
    it('should return valid non-empty string', () => {
      expect(validateString('test', 'field')).toBe('test');
      expect(validateString('  test  ', 'field')).toBe('  test  ');
    });

    it('should throw error for non-string values', () => {
      expect(() => validateString(123, 'field')).toThrow('field must be a non-empty string');
      expect(() => validateString(null, 'field')).toThrow('field must be a non-empty string');
      expect(() => validateString(undefined, 'field')).toThrow(
        'field must be a non-empty string'
      );
    });

    it('should throw error for empty string', () => {
      expect(() => validateString('', 'field')).toThrow('field must be a non-empty string');
      expect(() => validateString('   ', 'field')).toThrow('field must be a non-empty string');
    });
  });

  describe('validateNumber', () => {
    it('should return valid number', () => {
      expect(validateNumber(123, 'field')).toBe(123);
      expect(validateNumber(0, 'field')).toBe(0);
      expect(validateNumber(-5, 'field')).toBe(-5);
    });

    it('should throw error for non-number values', () => {
      expect(() => validateNumber('123', 'field')).toThrow('field must be a number');
      expect(() => validateNumber(null, 'field')).toThrow('field must be a number');
      expect(() => validateNumber(NaN, 'field')).toThrow('field must be a number');
    });

    it('should validate min constraint', () => {
      expect(validateNumber(10, 'field', 5)).toBe(10);
      expect(() => validateNumber(3, 'field', 5)).toThrow('field must be at least 5');
    });

    it('should validate max constraint', () => {
      expect(validateNumber(10, 'field', undefined, 15)).toBe(10);
      expect(() => validateNumber(20, 'field', undefined, 15)).toThrow('field must be at most 15');
    });

    it('should validate both min and max constraints', () => {
      expect(validateNumber(10, 'field', 5, 15)).toBe(10);
      expect(() => validateNumber(3, 'field', 5, 15)).toThrow('field must be at least 5');
      expect(() => validateNumber(20, 'field', 5, 15)).toThrow('field must be at most 15');
    });
  });

  describe('validateEmail', () => {
    it('should return valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe('test@example.com');
      expect(validateEmail('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk');
    });

    it('should throw error for invalid email addresses', () => {
      expect(() => validateEmail('invalid')).toThrow('Invalid email address');
      expect(() => validateEmail('invalid@')).toThrow('Invalid email address');
      expect(() => validateEmail('@example.com')).toThrow('Invalid email address');
      expect(() => validateEmail('invalid@.com')).toThrow('Invalid email address');
    });
  });

  describe('validateEnum', () => {
    const allowedValues = ['red', 'green', 'blue'] as const;

    it('should return valid enum value', () => {
      expect(validateEnum('red', 'color', allowedValues)).toBe('red');
      expect(validateEnum('green', 'color', allowedValues)).toBe('green');
    });

    it('should throw error for invalid enum value', () => {
      expect(() => validateEnum('yellow', 'color', allowedValues)).toThrow(
        'color must be one of: red, green, blue'
      );
    });
  });

  describe('validateDateTime', () => {
    it('should return valid ISO 8601 datetime strings', () => {
      const validDates = [
        '2024-01-15T10:00:00Z',
        '2024-01-15T10:00:00.000Z',
        '2024-01-15T10:00:00+05:30',
      ];

      validDates.forEach((date) => {
        expect(validateDateTime(date, 'dateTime')).toBe(date);
      });
    });

    it('should throw error for invalid datetime strings', () => {
      expect(() => validateDateTime('invalid', 'dateTime')).toThrow(
        'dateTime must be a valid ISO 8601 date/time string'
      );
      expect(() => validateDateTime('2024-13-01', 'dateTime')).toThrow(
        'dateTime must be a valid ISO 8601 date/time string'
      );
    });
  });

  describe('validateFileId', () => {
    it('should return valid file IDs', () => {
      expect(validateFileId('abc123')).toBe('abc123');
      expect(validateFileId('file-123_test')).toBe('file-123_test');
      expect(validateFileId('ABC-DEF_123')).toBe('ABC-DEF_123');
    });

    it('should throw error for invalid file IDs', () => {
      expect(() => validateFileId('')).toThrow('fileId must be a non-empty string');
      expect(() => validateFileId('file id with spaces')).toThrow(
        'fileId contains invalid characters'
      );
      expect(() => validateFileId('file/id')).toThrow('fileId contains invalid characters');
    });
  });

  describe('validateDocumentId', () => {
    it('should return valid document IDs', () => {
      expect(validateDocumentId('doc-123')).toBe('doc-123');
    });

    it('should throw error for invalid document IDs', () => {
      expect(() => validateDocumentId('doc with spaces')).toThrow(
        'fileId contains invalid characters'
      );
    });
  });

  describe('validateCalendarId', () => {
    it('should return "primary" as valid calendar ID', () => {
      expect(validateCalendarId('primary')).toBe('primary');
    });

    it('should validate email addresses as calendar IDs', () => {
      expect(validateCalendarId('user@example.com')).toBe('user@example.com');
    });

    it('should validate other calendar IDs', () => {
      expect(validateCalendarId('calendar123')).toBe('calendar123');
    });

    it('should throw error for invalid email in calendar ID', () => {
      expect(() => validateCalendarId('invalid@')).toThrow('Invalid email address');
    });
  });
});
