import { PrismaClient } from '@prisma/client'

// Add custom logging levels
type LogLevel = 'info' | 'query' | 'warn' | 'error'
type LogDefinition = {
  level: LogLevel
  emit: 'stdout' | 'event'
}

const logLevels: LogDefinition[] = 
  process.env.NODE_ENV === 'development' 
    ? [
        { level: 'query', emit: 'stdout' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : [
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]

// Configure Prisma options for Railway
const prismaOptions = {
  log: logLevels,
  errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
} as const

// Create a custom Prisma client with retry logic
class PrismaClientWithRetry extends PrismaClient {
  constructor() {
    super(prismaOptions)
    
    // Middleware for connection retry logic
    this.$use(async (params, next) => {
      const maxRetries = 3
      const retryDelay = 1000 // 1 second
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await next(params)
        } catch (error: any) {
          const isConnectionError = 
            error.code === 'P2024' || // Failed to connect
            error.code === 'P2025' || // Record not found (might be connection issue)
            error.message?.includes('connect') ||
            error.message?.includes('ECONNREFUSED') ||
            error.message?.includes('ETIMEDOUT')
          
          if (isConnectionError && attempt < maxRetries - 1) {
            console.warn(`Database connection error, retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
            continue
          }
          
          throw error
        }
      }
    })
  }
  
  // Custom connect method with health check
  async connect(): Promise<void> {
    try {
      await this.$connect()
      
      // Verify connection with a simple query
      await this.$queryRaw`SELECT 1`
      
      console.log('✅ Database connected successfully')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      throw error
    }
  }
  
  // Graceful disconnect
  async disconnect(): Promise<void> {
    try {
      await this.$disconnect()
      console.log('Database disconnected')
    } catch (error) {
      console.error('Error disconnecting from database:', error)
    }
  }
}

// Singleton pattern for Next.js
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientWithRetry | undefined
}

// Prevent multiple instances in development
const prismaClientSingleton = () => {
  return new PrismaClientWithRetry()
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Connection management for Railway
async function handleConnection() {
  // Set connection pool settings via connection string
  // Railway recommends connection_limit=10 for most apps
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  // Check if URL already has connection pool settings
  if (!databaseUrl.includes('connection_limit') && !databaseUrl.includes('pool_timeout')) {
    console.warn('⚠️  DATABASE_URL is missing connection pool settings. Consider adding: ?connection_limit=10&pool_timeout=30')
  }
  
  // Connect on first use
  if (process.env.NODE_ENV === 'production') {
    prisma.$connect().catch((error) => {
      console.error('Failed to connect to database:', error)
      process.exit(1)
    })
  }
}

// Initialize connection handling
handleConnection()

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connections...')
    await prisma.disconnect()
    process.exit(0)
  })
  
  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connections...')
    await prisma.disconnect()
    process.exit(0)
  })
}

// Export typed Prisma client
export { prisma }

// Export types for use in other files
export type { 
  User, 
  Client, 
  LabReport, 
  UserRole, 
  ReportType, 
  ProcessingStatus,
  ClientProfile,
  AdminProfile,
  UserSession,
  EmailVerification,
  RateLimit,
  NutriqResult,
  AiConversation,
  ConversationMessage,
  ConversationAnalysis,
  OnboardingSession,
  OnboardingProgress,
  ClientFile,
  ProtocolRecommendation,
  Note
} from '@prisma/client'

// Utility functions for common database operations
export const db = {
  // User operations
  user: {
    findByEmail: (email: string) => 
      prisma.user.findUnique({ 
        where: { email: email.toLowerCase() },
        include: { clientProfile: true, adminProfile: true }
      }),
    
    create: (data: Parameters<typeof prisma.user.create>[0]['data']) =>
      prisma.user.create({ data }),
    
    updateLastLogin: (userId: string) =>
      prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() }
      }),
  },
  
  // Session operations
  session: {
    create: (data: Parameters<typeof prisma.userSession.create>[0]['data']) =>
      prisma.userSession.create({ data }),
    
    findValid: (tokenHash: string) =>
      prisma.userSession.findFirst({
        where: {
          tokenHash,
          expiresAt: { gt: new Date() }
        },
        include: { user: true }
      }),
    
    deleteExpired: () =>
      prisma.userSession.deleteMany({
        where: { expiresAt: { lt: new Date() } }
      }),
  },
  
  // Rate limiting
  rateLimit: {
    increment: async (identifier: string, action: string) => {
      const existing = await prisma.rateLimit.findUnique({
        where: { identifier_action: { identifier, action } }
      })
      
      if (existing) {
        return prisma.rateLimit.update({
          where: { id: existing.id },
          data: { 
            attempts: { increment: 1 },
            lastAttempt: new Date()
          }
        })
      }
      
      return prisma.rateLimit.create({
        data: { identifier, action, attempts: 1 }
      })
    },
    
    checkLimit: async (identifier: string, action: string, maxAttempts: number = 5) => {
      const record = await prisma.rateLimit.findUnique({
        where: { identifier_action: { identifier, action } }
      })
      
      if (!record) return { allowed: true }
      
      // Reset after 15 minutes
      const resetTime = 15 * 60 * 1000
      const timeSinceLastAttempt = Date.now() - record.lastAttempt.getTime()
      
      if (timeSinceLastAttempt > resetTime) {
        await prisma.rateLimit.delete({ where: { id: record.id } })
        return { allowed: true }
      }
      
      return { 
        allowed: record.attempts < maxAttempts,
        remainingAttempts: Math.max(0, maxAttempts - record.attempts),
        resetAt: new Date(record.lastAttempt.getTime() + resetTime)
      }
    }
  }
}

// Health check function for Railway
export async function checkDatabaseHealth() {
  try {
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
