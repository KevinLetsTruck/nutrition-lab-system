import { NextResponse } from 'next/server';

export interface CacheOptions {
  maxAge?: number; // seconds
  staleWhileRevalidate?: number; // seconds
  tags?: string[];
}

export function createCachedResponse(
  data: any,
  options: CacheOptions = {}
): NextResponse {
  const {
    maxAge = 300, // 5 minutes default
    staleWhileRevalidate = 60, // 1 minute default
    tags = [],
  } = options;

  const response = NextResponse.json(data);

  // Set cache headers
  response.headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );

  // Add cache tags for invalidation
  if (tags.length > 0) {
    response.headers.set('Cache-Tags', tags.join(','));
  }

  // Add ETag for conditional requests
  const etag = generateETag(data);
  response.headers.set('ETag', etag);

  return response;
}

export function generateETag(data: any): string {
  // Simple ETag generation based on content hash
  const content = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(36)}"`;
}

export function checkIfModified(
  request: Request,
  etag: string
): boolean {
  const ifNoneMatch = request.headers.get('If-None-Match');
  return ifNoneMatch !== etag;
}

// In-memory cache for development (use Redis in production)
const cache = new Map<string, { data: any; expires: number; etag: string }>();

export function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expires) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCached(key: string, data: any, ttl: number = 300): void {
  const expires = Date.now() + (ttl * 1000);
  const etag = generateETag(data);
  cache.set(key, { data, expires, etag });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}
