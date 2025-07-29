interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const key = identifier
    const record = this.store[key]

    // Clean up expired records
    if (record && now > record.resetTime) {
      delete this.store[key]
    }

    // Check if rate limit exceeded
    if (record && record.count >= this.config.maxRequests) {
      return false
    }

    // Update or create record
    if (!record) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
    } else {
      record.count++
    }

    return true
  }

  getRemaining(identifier: string): number {
    const record = this.store[identifier]
    if (!record) {
      return this.config.maxRequests
    }
    return Math.max(0, this.config.maxRequests - record.count)
  }

  getResetTime(identifier: string): number {
    const record = this.store[identifier]
    return record ? record.resetTime : Date.now() + this.config.windowMs
  }

  // Clean up expired records
  cleanup(): void {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key]
      }
    })
  }
}

// Create rate limiters for different endpoints
const rateLimiters = {
  analyze: new RateLimiter({
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
  }),
  upload: new RateLimiter({
    maxRequests: 50,
    windowMs: 900000 // 15 minutes
  }),
  general: new RateLimiter({
    maxRequests: 1000,
    windowMs: 900000 // 15 minutes
  })
}

// Clean up expired records every 5 minutes
setInterval(() => {
  Object.values(rateLimiters).forEach(limiter => limiter.cleanup())
}, 5 * 60 * 1000)

export function getRateLimiter(endpoint: 'analyze' | 'upload' | 'general') {
  return rateLimiters[endpoint]
}

export function getClientIdentifier(request: Request): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // For API key based limiting, you could extract from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    return `api:${authHeader.split(' ')[1] || 'unknown'}`
  }
  
  return `ip:${ip}`
}

export function createRateLimitHeaders(limiter: RateLimiter, identifier: string) {
  return {
    'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
    'X-RateLimit-Remaining': limiter.getRemaining(identifier).toString(),
    'X-RateLimit-Reset': Math.ceil(limiter.getResetTime(identifier) / 1000).toString(),
  }
} 