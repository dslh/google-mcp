import { createValidationError } from './error-handler.js';

export function validateRequired<T>(value: T | undefined, name: string): T {
  if (value === undefined || value === null) {
    throw createValidationError(`${name} is required`);
  }
  return value;
}

export function validateString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createValidationError(`${name} must be a non-empty string`);
  }
  return value;
}

export function validateNumber(value: unknown, name: string, min?: number, max?: number): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw createValidationError(`${name} must be a number`);
  }
  if (min !== undefined && value < min) {
    throw createValidationError(`${name} must be at least ${min}`);
  }
  if (max !== undefined && value > max) {
    throw createValidationError(`${name} must be at most ${max}`);
  }
  return value;
}

export function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createValidationError(`Invalid email address: ${email}`);
  }
  return email;
}

export function validateEnum<T extends string>(
  value: string,
  name: string,
  allowedValues: readonly T[]
): T {
  if (!allowedValues.includes(value as T)) {
    throw createValidationError(
      `${name} must be one of: ${allowedValues.join(', ')}`
    );
  }
  return value as T;
}

export function validateDateTime(dateTime: string, name: string): string {
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) {
    throw createValidationError(
      `${name} must be a valid ISO 8601 date/time string`
    );
  }
  return dateTime;
}

export function validateFileId(fileId: string): string {
  validateString(fileId, 'fileId');
  // Google Drive file IDs are typically alphanumeric with hyphens and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    throw createValidationError('fileId contains invalid characters');
  }
  return fileId;
}

export function validateDocumentId(documentId: string): string {
  return validateFileId(documentId);
}

export function validateCalendarId(calendarId: string): string {
  validateString(calendarId, 'calendarId');
  // Calendar ID can be 'primary' or an email address or a special ID
  if (calendarId === 'primary') {
    return calendarId;
  }
  // If it looks like an email, validate it
  if (calendarId.includes('@')) {
    return validateEmail(calendarId);
  }
  // Otherwise it's a calendar ID (similar format to file IDs)
  return calendarId;
}
