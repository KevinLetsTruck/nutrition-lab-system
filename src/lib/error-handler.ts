// Standardized error response type
export interface APIError {
  error: string;
  details?: string;
  code?: string;
  timestamp: string;
  path?: string;
  action?: string;
  debug?: {
    stack?: string;
    context?: any;
  };
}

// Custom error class for API errors
export class APIRequestError extends Error {
  public statusCode: number;
  public details: any;
  
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'APIRequestError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Server-side error handler
export function handleAPIError(
  error: unknown, 
  context?: { action?: string; body?: any; path?: string }
): APIError {
  console.error('API Error:', error);
  
  const timestamp = new Date().toISOString();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error instanceof APIRequestError) {
    return {
      error: error.message,
      details: error.details,
      code: error.statusCode.toString(),
      timestamp,
      path: context?.path,
      action: context?.action,
      debug: isDevelopment ? { 
        stack: error.stack,
        context 
      } : undefined
    };
  }
  
  if (error instanceof Error) {
    return {
      error: 'Internal server error',
      details: error.message,
      timestamp,
      path: context?.path,
      action: context?.action,
      debug: isDevelopment ? { 
        stack: error.stack,
        context 
      } : undefined
    };
  }
  
  return {
    error: 'Unknown error occurred',
    details: String(error),
    timestamp,
    path: context?.path,
    action: context?.action,
    debug: isDevelopment ? { context } : undefined
  };
}

// Client-side error parser
export async function parseAPIError(response: Response): Promise<APIRequestError> {
  let errorData: APIError;
  
  try {
    errorData = await response.json();
  } catch {
    // If response isn't JSON, create a basic error
    errorData = {
      error: `HTTP ${response.status}: ${response.statusText}`,
      timestamp: new Date().toISOString()
    };
  }
  
  // Log full error details in development
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.error('API Error Details:', errorData);
  }
  
  const message = errorData.details || errorData.error || 'Unknown error';
  return new APIRequestError(message, response.status, errorData);
}