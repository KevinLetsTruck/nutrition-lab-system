/**
 * Standard API response interface for consistent error handling and data structure
 * @template T - The type of data returned in successful responses
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  timestamp?: string;
}

/**
 * Paginated API response interface
 * @template T - The type of items in the data array
 */
export interface PaginatedAPIResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API error response with detailed error information
 */
export interface APIErrorResponse extends APIResponse<never> {
  success: false;
  error: string;
  code?: string;
  statusCode?: number;
  details?: {
    field?: string;
    message?: string;
    [key: string]: any;
  };
}

/**
 * Success response helper type
 * @template T - The type of data returned
 */
export type APISuccessResponse<T> = APIResponse<T> & {
  success: true;
  data: T;
};
