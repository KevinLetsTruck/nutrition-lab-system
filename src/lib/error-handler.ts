import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', error);
  }

  // Handle known error types
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Handle authentication errors
  if (error instanceof Error) {
    if (error.message.includes('authorization') || error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 401 }
      );
    }

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Resource not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
  }

  // Generic server error
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error instanceof Error ? error.message : String(error),
      }),
    },
    { status: 500 }
  );
}

export function createAuthError(message: string = 'Authentication required'): AppError {
  return new AppError(message, 401, 'AUTH_ERROR');
}

export function createValidationError(message: string, details?: any): AppError {
  return new AppError(message, 400, 'VALIDATION_ERROR', details);
}

export function createNotFoundError(resource: string = 'Resource'): AppError {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
}
