/**
 * API client for making requests to the backend
 * Handles base URL configuration for different environments
 */

export function getBaseUrl() {
  // In the browser, use relative URLs
  if (typeof window !== 'undefined') {
    return ''
  }
  
  // On the server, use the deployment URL if available
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Fallback to localhost for local development
  return 'http://localhost:3000'
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${endpoint}`
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}