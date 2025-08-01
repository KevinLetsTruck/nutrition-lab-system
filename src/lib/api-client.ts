import { parseAPIError } from './error-handler';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export class APIClient {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds
  
  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }
  
  async fetch<T = any>(
    path: string, 
    options: FetchOptions = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const url = this.baseURL + path;
      console.log(`API Request: ${fetchOptions.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        }
      });
      
      if (!response.ok) {
        throw await parseAPIError(response);
      }
      
      const data = await response.json();
      console.log(`API Response: ${url}`, data);
      return data;
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  async post<T = any>(path: string, data: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async get<T = any>(path: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'GET'
    });
  }
  
  async put<T = any>(path: string, data: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async delete<T = any>(path: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'DELETE'
    });
  }
}

// Create a singleton instance
export const apiClient = new APIClient();