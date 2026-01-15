/**
 * Structured error response from backend API.
 * Matches the ErrorResponse model in backend/src/schemas/error.py
 */
export interface ErrorResponse {
  error_code: string;
  detail: string;
  source: 'AI_PROVIDER' | 'AUTHENTICATION' | 'VALIDATION' | 'DATABASE' | 'INTERNAL';
  provider?: string;
}

/**
 * Standard error codes used across the application.
 * Matches ErrorCode class in backend/src/schemas/error.py
 */
export const ErrorCode = {
  // AI Provider errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_KEY_INVALID: 'API_KEY_INVALID',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  PROVIDER_ERROR: 'PROVIDER_ERROR',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  MESSAGE_EMPTY: 'MESSAGE_EMPTY',

  // Database errors
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Internal errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Type for error code values
 */
export type ErrorCodeValue = typeof ErrorCode[keyof typeof ErrorCode];

/**
 * Custom error class that wraps structured error responses from the API.
 */
export class ApiError extends Error {
  public readonly errorCode: string;
  public readonly source: ErrorResponse['source'];
  public readonly provider?: string;
  public readonly statusCode: number;

  constructor(
    errorResponse: ErrorResponse,
    statusCode: number,
    message?: string
  ) {
    super(message || errorResponse.detail);
    this.name = 'ApiError';
    this.errorCode = errorResponse.error_code;
    this.source = errorResponse.source;
    this.provider = errorResponse.provider;
    this.statusCode = statusCode;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Get a user-friendly error message based on the error code.
   */
  getUserFriendlyMessage(): string {
    switch (this.errorCode) {
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return 'Too many requests. Please wait a moment and try again.';

      case ErrorCode.API_KEY_MISSING:
        return 'AI service is not configured. Please contact support.';

      case ErrorCode.API_KEY_INVALID:
        return 'AI service authentication failed. Please contact support.';

      case ErrorCode.PROVIDER_UNAVAILABLE:
        return 'AI service is temporarily unavailable. Please try again in a few moments.';

      case ErrorCode.PROVIDER_ERROR:
        return 'AI service encountered an error. Please try again.';

      case ErrorCode.UNAUTHORIZED:
        return 'You are not authorized to perform this action.';

      case ErrorCode.TOKEN_EXPIRED:
        return 'Your session has expired. Please log in again.';

      case ErrorCode.TOKEN_INVALID:
        return 'Invalid authentication. Please log in again.';

      case ErrorCode.MESSAGE_TOO_LONG:
        return 'Your message is too long. Please shorten it and try again.';

      case ErrorCode.MESSAGE_EMPTY:
        return 'Please enter a message before sending.';

      case ErrorCode.CONVERSATION_NOT_FOUND:
        return 'Conversation not found. Please start a new conversation.';

      case ErrorCode.DATABASE_ERROR:
        return 'A database error occurred. Please try again.';

      case ErrorCode.INTERNAL_ERROR:
      case ErrorCode.UNKNOWN_ERROR:
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if this error should trigger a logout (authentication errors).
   */
  shouldLogout(): boolean {
    const authErrors: string[] = [
      ErrorCode.UNAUTHORIZED,
      ErrorCode.TOKEN_EXPIRED,
      ErrorCode.TOKEN_INVALID,
    ];
    return authErrors.includes(this.errorCode);
  }

  /**
   * Check if this error is retryable (temporary failures).
   */
  isRetryable(): boolean {
    const retryableErrors: string[] = [
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCode.PROVIDER_UNAVAILABLE,
      ErrorCode.DATABASE_ERROR,
    ];
    return retryableErrors.includes(this.errorCode);
  }
}
