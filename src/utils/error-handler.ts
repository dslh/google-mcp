import { ErrorResponse, ErrorType } from '../types/schema.js';
import { logger } from './logger.js';

export class GoogleMCPError extends Error {
  constructor(
    public errorType: ErrorType,
    message: string,
    public details?: ErrorResponse['details']
  ) {
    super(message);
    this.name = 'GoogleMCPError';
  }

  toResponse(): ErrorResponse {
    return {
      error: true,
      errorType: this.errorType,
      message: this.message,
      details: this.details,
    };
  }
}

export function handleError(error: unknown): ErrorResponse {
  // Already a GoogleMCPError
  if (error instanceof GoogleMCPError) {
    logger.error(`${error.errorType}: ${error.message}`, error.details);
    return error.toResponse();
  }

  // Google API errors
  if (isGoogleAPIError(error)) {
    const apiError = error as GoogleAPIError;
    const errorType = getErrorType(apiError.code);
    const message = getErrorMessage(apiError);

    logger.error(`Google API Error (${apiError.code}): ${message}`);

    return {
      error: true,
      errorType,
      message,
      details: {
        code: apiError.code?.toString(),
        remediation: getRemediation(apiError.code),
      },
    };
  }

  // Generic errors
  logger.error('Unexpected error:', error);
  return {
    error: true,
    errorType: 'APIError',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
  };
}

interface GoogleAPIError {
  code?: number;
  message?: string;
  errors?: Array<{
    domain?: string;
    reason?: string;
    message?: string;
  }>;
}

function isGoogleAPIError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'errors' in error)
  );
}

function getErrorType(code?: number): ErrorType {
  if (!code) return 'APIError';

  if (code === 401 || code === 403) return 'AuthError';
  if (code === 429) return 'APIError';
  if (code === 404) return 'ValidationError';
  if (code >= 500) return 'NetworkError';

  return 'APIError';
}

function getErrorMessage(error: GoogleAPIError): string {
  if (error.message) return error.message;
  if (error.errors && error.errors.length > 0) {
    return error.errors[0].message || 'Unknown error';
  }
  return 'An error occurred while calling the Google API';
}

function getRemediation(code?: number): string {
  switch (code) {
    case 401:
      return 'Please re-authenticate by running the OAuth flow again';
    case 403:
      return 'Check that you have the required permissions and OAuth scopes';
    case 404:
      return 'The requested resource was not found. Verify the ID is correct';
    case 429:
      return 'Rate limit exceeded. Please wait a moment and try again';
    default:
      return 'Please check your request and try again';
  }
}

export function createAuthError(message: string, requiredScopes?: string[]): GoogleMCPError {
  return new GoogleMCPError('AuthError', message, {
    code: 'INSUFFICIENT_PERMISSIONS',
    requiredScopes,
    remediation: 'Please re-authenticate with the required scopes',
  });
}

export function createValidationError(message: string): GoogleMCPError {
  return new GoogleMCPError('ValidationError', message, {
    code: 'INVALID_INPUT',
    remediation: 'Please check your input parameters and try again',
  });
}
