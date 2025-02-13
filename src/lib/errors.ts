import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Custom error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_REQUIRED', 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` with ID ${id}` : ''} not found`,
      'NOT_FOUND',
      404,
      { resource, id }
    );
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      originalError ? { originalError: originalError.message } : undefined
    );
    this.name = 'DatabaseError';
  }
}

// Error handling utilities
export function handlePrismaError(error: any): never {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ValidationError('A record with this value already exists', {
          field: error.meta?.target as string[],
        });
      case 'P2025':
        throw new NotFoundError('Record');
      case 'P2003':
        throw new ValidationError('Invalid relation reference', {
          field: error.meta?.field_name,
        });
      default:
        throw new DatabaseError(`Database error: ${error.message}`);
    }
  }
  throw new DatabaseError('An unexpected database error occurred');
}

// Logging utility
export function logError(error: Error, context?: Record<string, any>) {
  // In production, this would send to a logging service
  console.error('[Error]', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}

// Response formatting
export function formatErrorResponse(error: Error) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        context: error.context,
      },
    };
  }

  // For unexpected errors, return a generic error response
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
}