import {
  APICallError,
  DownloadError,
  EmptyResponseBodyError,
  InvalidArgumentError,
  InvalidDataContentError,
  InvalidMessageRoleError,
  InvalidPromptError,
  InvalidResponseDataError,
  InvalidToolInputError,
  JSONParseError,
  LoadAPIKeyError,
  LoadSettingError,
  MessageConversionError,
  NoContentGeneratedError,
  NoImageGeneratedError,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  NoOutputSpecifiedError,
  NoSpeechGeneratedError,
  NoSuchModelError,
  NoSuchProviderError,
  NoSuchToolError,
  RetryError,
  ToolCallRepairError,
  TooManyEmbeddingValuesForCallError,
  TypeValidationError,
  UnsupportedFunctionalityError,
} from 'ai';
import { APIError } from 'better-auth';
import * as z from 'zod/v4';

export const APP_ERROR_CODES_BY_KEY = {
  PARSE_ERROR: 400,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_SUPPORTED: 405,
  TIMEOUT: 408,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
} as const;

export type APP_ERROR_CODE_KEY = keyof typeof APP_ERROR_CODES_BY_KEY;

// User-friendly error messages for different error codes
export const ERROR_MESSAGES: Record<APP_ERROR_CODE_KEY, string> = {
  PARSE_ERROR:
    'Failed to parse request data. Please check your input and try again.',
  BAD_REQUEST: 'Invalid request. Please check your input and try again.',
  INTERNAL_SERVER_ERROR:
    'An internal server error occurred. Please try again later.',
  NOT_IMPLEMENTED: 'This feature is not yet implemented.',
  UNAUTHORIZED: 'You must be logged in to access this resource.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  METHOD_NOT_SUPPORTED: 'This HTTP method is not supported for this endpoint.',
  TIMEOUT: 'The request timed out. Please try again.',
  CONFLICT: 'This action conflicts with existing data.',
  PRECONDITION_FAILED: 'The request preconditions were not met.',
  PAYLOAD_TOO_LARGE: 'The request payload is too large.',
  UNPROCESSABLE_CONTENT: 'The request content could not be processed.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait before trying again.',
  CLIENT_CLOSED_REQUEST: 'The request was closed before completion.',
} as const;

export class AppError extends Error {
  public readonly code: APP_ERROR_CODE_KEY;
  public readonly cause?: unknown;

  constructor(opts: {
    message?: string;
    code: APP_ERROR_CODE_KEY;
    cause?: unknown;
  }) {
    const message = opts.message ?? ERROR_MESSAGES[opts.code];

    super(message);

    this.code = opts.code;
    this.cause = opts.cause;
    this.name = 'AppError';
  }

  getStatusFromCode(): number {
    return APP_ERROR_CODES_BY_KEY[this.code];
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.getStatusFromCode(),
      cause: this.cause,
    };
  }
}

/**
 * Helper function to create a standardized error response
 */
export function createErrorResponse(
  error: AppError | Error | unknown,
  fallbackCode: APP_ERROR_CODE_KEY = 'INTERNAL_SERVER_ERROR'
) {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.getStatusFromCode(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: fallbackCode,
      statusCode: APP_ERROR_CODES_BY_KEY[fallbackCode],
    };
  }

  return {
    message: ERROR_MESSAGES[fallbackCode],
    code: fallbackCode,
    statusCode: APP_ERROR_CODES_BY_KEY[fallbackCode],
  };
}

// BEGIN AI SDK ERROR HANDLING ---------------------------------------------

export const unknownError = 'Something went wrong. Please try again.';

/**
 * Subset of AI SDK error names we want to handle and their user-friendly messages.
 * See: https://ai-sdk.dev/docs/reference/ai-sdk-errors
 */
const AI_SDK_ERROR_HANDLERS = [
  [APICallError, 'The AI service failed to process the request.'],
  [DownloadError, 'Failed to download resources required for the AI request.'],
  [EmptyResponseBodyError, 'Received an empty response from the AI provider.'],
  [InvalidArgumentError, 'Invalid argument supplied to the AI request.'],
  [InvalidDataContentError, 'The AI data content is invalid.'],
  [InvalidMessageRoleError, 'Invalid message role provided to the AI.'],
  [InvalidPromptError, 'The prompt supplied to the AI model is invalid.'],
  [InvalidResponseDataError, 'The AI provider returned invalid data.'],
  [InvalidToolInputError, 'The input passed to the AI tool is invalid.'],
  [JSONParseError, 'Failed to parse JSON from the AI response.'],
  [LoadAPIKeyError, 'Unable to load the AI API key. Please configure it.'],
  [LoadSettingError, 'Failed to load AI settings.'],
  [MessageConversionError, 'Error converting messages for the AI provider.'],
  [NoSpeechGeneratedError, 'The AI model failed to generate speech.'],
  [
    NoContentGeneratedError,
    'The AI model did not produce any content. Please try again.',
  ],
  [
    NoImageGeneratedError,
    'The AI model did not generate an image. Please try again.',
  ],
  [NoOutputGeneratedError, 'The AI model failed to generate output.'],
  [
    NoObjectGeneratedError,
    'The AI model did not produce the expected structured data.',
  ],
  [NoOutputSpecifiedError, 'No output type was specified for the AI request.'],
  [NoSuchModelError, 'The requested AI model does not exist.'],
  [NoSuchProviderError, 'The specified AI provider is not available.'],
  [NoSuchToolError, 'The specified AI tool does not exist.'],
  [
    RetryError,
    'The AI request failed repeatedly. Please wait and try again later.',
  ],
  [
    ToolCallRepairError,
    'The AI tool call parameters needed repair and failed.',
  ],
  [
    TooManyEmbeddingValuesForCallError,
    'Too many embedding values were supplied for the AI call.',
  ],
  [
    TypeValidationError,
    'The AI response did not match the expected format. Please review your prompt or schema.',
  ],
  [
    UnsupportedFunctionalityError,
    'This AI functionality is not supported by the chosen model.',
  ],
] as const satisfies ReadonlyArray<
  [{ isInstance: (err: unknown) => boolean }, string]
>;

/**
 * Returns a user-friendly message if the error is an AI SDK error we know about.
 */
export function getAISDKErrorMessage(err: unknown): string | undefined {
  for (const [ErrCls, msg] of AI_SDK_ERROR_HANDLERS) {
    // Each AI error class has a static isInstance helper
    if (ErrCls.isInstance(err)) return msg;
  }
  return undefined;
}

// END AI SDK ERROR HANDLING -----------------------------------------------

/**
 * Enhanced error message extraction that handles AppError instances
 */
export function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }

  // Handle AI SDK errors early
  const aiMsg = getAISDKErrorMessage(err);
  if (aiMsg) return aiMsg;

  if (err instanceof AppError) {
    return err.message;
  } else if (err instanceof APIError) {
    return err.message;
  } else if (err instanceof z.ZodError) {
    return err.issues.map((e) => e.message).join(', ') ?? unknownError;
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}

/**
 * Creates a standardized validation error from Zod issues
 */
export function createValidationError(issues: z.ZodIssue[]): AppError {
  const message = issues.map((issue) => issue.message).join(', ');
  return new AppError({
    code: 'UNPROCESSABLE_CONTENT',
    message: `Validation error: ${message}`,
  });
}

/**
 * Creates a standardized database error
 */
export function createDatabaseError(
  message?: string,
  cause?: unknown
): AppError {
  return new AppError({
    code: 'INTERNAL_SERVER_ERROR',
    message: message ?? 'Database operation failed',
    cause,
  });
}

/**
 * Creates a standardized authentication error
 */
export function createAuthError(message?: string): AppError {
  return new AppError({
    code: 'UNAUTHORIZED',
    message: message ?? 'Authentication required',
  });
}

/**
 * Creates a standardized conflict error (e.g., duplicate data)
 */
export function createConflictError(
  message?: string,
  cause?: unknown
): AppError {
  return new AppError({
    code: 'CONFLICT',
    message: message ?? 'Resource already exists',
    cause,
  });
}

/**
 * Creates a standardized external service error (e.g., scraping, AI service)
 */
export function createExternalServiceError(
  service: string,
  message?: string,
  cause?: unknown
): AppError {
  return new AppError({
    code: 'INTERNAL_SERVER_ERROR',
    message: message ?? `${service} service unavailable`,
    cause,
  });
}
