import { describe, it, expect } from 'vitest';
import {
  GoogleMCPError,
  handleError,
  createAuthError,
  createValidationError,
} from '../../src/utils/error-handler.js';

describe('error-handler', () => {
  describe('GoogleMCPError', () => {
    it('should create error with type and message', () => {
      const error = new GoogleMCPError('ValidationError', 'Invalid input');

      expect(error.errorType).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('GoogleMCPError');
    });

    it('should create error with details', () => {
      const error = new GoogleMCPError('AuthError', 'Not authenticated', {
        code: 'AUTH_REQUIRED',
        remediation: 'Please log in',
      });

      expect(error.details).toEqual({
        code: 'AUTH_REQUIRED',
        remediation: 'Please log in',
      });
    });

    it('should convert to error response', () => {
      const error = new GoogleMCPError('APIError', 'API failed', {
        code: 'API_ERROR',
      });

      const response = error.toResponse();

      expect(response).toEqual({
        error: true,
        errorType: 'APIError',
        message: 'API failed',
        details: { code: 'API_ERROR' },
      });
    });
  });

  describe('handleError', () => {
    it('should handle GoogleMCPError', () => {
      const error = new GoogleMCPError('ValidationError', 'Invalid input');
      const response = handleError(error);

      expect(response).toEqual({
        error: true,
        errorType: 'ValidationError',
        message: 'Invalid input',
      });
    });

    it('should handle Google API 401 error', () => {
      const apiError = {
        code: 401,
        message: 'Unauthorized',
      };

      const response = handleError(apiError);

      expect(response.error).toBe(true);
      expect(response.errorType).toBe('AuthError');
      expect(response.message).toBe('Unauthorized');
      expect(response.details?.remediation).toContain('re-authenticate');
    });

    it('should handle Google API 403 error', () => {
      const apiError = {
        code: 403,
        message: 'Forbidden',
      };

      const response = handleError(apiError);

      expect(response.error).toBe(true);
      expect(response.errorType).toBe('AuthError');
      expect(response.details?.remediation).toContain('permissions');
    });

    it('should handle Google API 404 error', () => {
      const apiError = {
        code: 404,
        message: 'Not found',
      };

      const response = handleError(apiError);

      expect(response.error).toBe(true);
      expect(response.errorType).toBe('ValidationError');
      expect(response.details?.remediation).toContain('not found');
    });

    it('should handle Google API 429 error', () => {
      const apiError = {
        code: 429,
        message: 'Rate limit exceeded',
      };

      const response = handleError(apiError);

      expect(response.error).toBe(true);
      expect(response.errorType).toBe('APIError');
      expect(response.details?.remediation).toContain('Rate limit');
    });

    it('should handle Google API 500 error', () => {
      const apiError = {
        code: 500,
        message: 'Internal server error',
      };

      const response = handleError(apiError);

      expect(response.error).toBe(true);
      expect(response.errorType).toBe('NetworkError');
    });

    it('should handle Google API error with errors array', () => {
      const apiError = {
        code: 400,
        errors: [
          {
            domain: 'global',
            reason: 'invalid',
            message: 'Invalid parameter',
          },
        ],
      };

      const response = handleError(apiError);

      expect(response.error).toBe(true);
      expect(response.message).toBe('Invalid parameter');
    });

    it('should handle generic Error objects', () => {
      const error = new Error('Something went wrong');
      const response = handleError(error);

      expect(response).toEqual({
        error: true,
        errorType: 'APIError',
        message: 'Something went wrong',
      });
    });

    it('should handle unknown error types', () => {
      const error = { unexpected: 'error' };
      const response = handleError(error);

      expect(response).toEqual({
        error: true,
        errorType: 'APIError',
        message: 'An unexpected error occurred',
      });
    });
  });

  describe('createAuthError', () => {
    it('should create auth error without scopes', () => {
      const error = createAuthError('Not authenticated');

      expect(error.errorType).toBe('AuthError');
      expect(error.message).toBe('Not authenticated');
      expect(error.details?.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should create auth error with required scopes', () => {
      const error = createAuthError('Need more permissions', [
        'https://www.googleapis.com/auth/drive',
      ]);

      expect(error.errorType).toBe('AuthError');
      expect(error.details?.requiredScopes).toEqual([
        'https://www.googleapis.com/auth/drive',
      ]);
    });
  });

  describe('createValidationError', () => {
    it('should create validation error', () => {
      const error = createValidationError('Invalid input parameter');

      expect(error.errorType).toBe('ValidationError');
      expect(error.message).toBe('Invalid input parameter');
      expect(error.details?.code).toBe('INVALID_INPUT');
    });
  });
});
