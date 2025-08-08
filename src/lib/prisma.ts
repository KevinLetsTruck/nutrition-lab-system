import { PrismaClient, Prisma } from '@prisma/client'

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

// Railway-optimized connection string processing
function getOptimizedDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || ''
  
  // Parse existing URL
  const urlObj = new URL(url)
  const params = new URLSearchParams(urlObj.search)
  
  // Railway-specific optimizations
  if (!params.has('pgbouncer')) params.set('pgbouncer', 'true')
  if (!params.has('sslmode')) params.set('sslmode', 'require')
  if (!params.has('connect_timeout')) params.set('connect_timeout', '30')
  if (!params.has('statement_timeout')) params.set('statement_timeout', '30000')
  if (!params.has('pool_timeout')) params.set('pool_timeout', '30')
  if (!params.has('connection_limit')) params.set('connection_limit', '10')
  
  // Reconstruct URL with optimized params
  urlObj.search = params.toString()
  return urlObj.toString()
}

// Configure Prisma options for Railway
const prismaOptions: Prisma.PrismaClientOptions = {
  datasources: {
    db: {
      url: getOptimizedDatabaseUrl()
    }
  },
  log: logLevels,
  errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
}

// Create a custom Prisma client with retry logic
class PrismaClientWithRetry extends PrismaClient {
  private connectionAttempts = 0
  private lastConnectionError: Date | null = null
  
  constructor() {
    super(prismaOptions)
    
    // Enhanced middleware for connection retry logic
    this.$use(async (params, next) => {
      const maxRetries = 3
      const baseDelay = 1000 // 1 second
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Reset connection attempts on successful query
          if (this.connectionAttempts > 0) {
            this.connectionAttempts = 0
            console.log('✅ Database connection restored')
          }
          
          return await next(params)
        } catch (error: any) {
          this.connectionAttempts++
          this.lastConnectionError = new Date()
          
          // Enhanced error detection for Railway
          const isConnectionError = 
            error.code === 'P2024' || // Failed to connect
            error.code === 'P2025' || // Record not found (might be connection issue)
            error.code === 'P1001' || // Can't reach database server
            error.code === 'P1002' || // Database server was reached but timed out
            error.code === 'P1003' || // Database does not exist
            error.code === 'P1008' || // Operations timed out
            error.code === 'P1017' || // Server has closed the connection
            error.message?.includes('connect') ||
            error.message?.includes('ECONNREFUSED') ||
            error.message?.includes('ETIMEDOUT') ||
            error.message?.includes('ENETUNREACH') ||
            error.message?.includes('socket hang up') ||
            error.message?.includes('Connection terminated')
          
          if (isConnectionError && attempt < maxRetries - 1) {
            const delay = baseDelay * Math.pow(2, attempt) // Exponential backoff
            console.warn(`⚠️  Database connection error (${error.code || 'UNKNOWN'}), retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)
            console.warn(`Error details: ${error.message}`)
            
            await new Promise(resolve => setTimeout(resolve, delay))
            
            // Try to reconnect if too many failures
            if (this.connectionAttempts > 5) {
              console.log('🔄 Attempting to reconnect to database...')
              try {
                await this.$disconnect()
                await this.$connect()
              } catch (reconnectError) {
                console.error('❌ Reconnection failed:', reconnectError)
              }
            }
            
            continue
          }
          
          // Log the final error
          console.error('❌ Database operation failed after all retries:', {
            code: error.code,
            message: error.message,
            clientVersion: error.clientVersion,
            attempts: this.connectionAttempts
          })
          
          throw error
        }
      }
    })
  }
  
  // Custom connect method with health check
  async connect(): Promise<void> {
    const startTime = Date.now()
    try {
      await this.$connect()
      
      // Verify connection with a simple query
      await this.$queryRaw`SELECT 1`
      
      const connectionTime = Date.now() - startTime
      console.log(`✅ Database connected successfully (${connectionTime}ms)`)
    } catch (error: any) {
      const connectionTime = Date.now() - startTime
      console.error(`❌ Database connection failed after ${connectionTime}ms:`, {
        code: error.code,
        message: error.message
      })
      throw error
    }
  }
  
  // Graceful disconnect
  async disconnect(): Promise<void> {
    try {
      await this.$disconnect()
      console.log('🔌 Database disconnected')
    } catch (error) {
      console.error('Error disconnecting from database:', error)
    }
  }
  
  // Get connection status
  getConnectionStatus() {
    return {
      attempts: this.connectionAttempts,
      lastError: this.lastConnectionError,
      isHealthy: this.connectionAttempts === 0
    }
  }
}

// Singleton pattern for Next.js
declare global {
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
  // Skip in Edge Runtime
  if (typeof (globalThis as any).EdgeRuntime !== 'undefined') {
    return
  }
  
  // Validate DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  try {
    const url = new URL(databaseUrl)
    console.log(`🔗 Connecting to database at ${url.hostname}`)
    
    // Log connection parameters for debugging
    const params = new URLSearchParams(url.search)
    console.log('📊 Connection parameters:', {
      sslmode: params.get('sslmode') || 'not set',
      connection_limit: params.get('connection_limit') || 'not set',
      pool_timeout: params.get('pool_timeout') || 'not set',
      pgbouncer: params.get('pgbouncer') || 'not set'
    })
  } catch (error) {
    console.error('Invalid DATABASE_URL format:', error)
  }
  
  // Connect on first use with retry
  if (process.env.NODE_ENV === 'production') {
    const connectWithRetry = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          await prisma.connect()
          return
        } catch (error) {
          console.error(`Connection attempt ${i + 1}/${retries} failed:`, error)
          if (i === retries - 1) {
            console.error('Failed to connect to database after all retries')
            // Don't use process.exit in Edge Runtime
            if (typeof (globalThis as any).EdgeRuntime === 'undefined' && typeof process !== 'undefined' && process.exit) {
              process.exit(1)
            }
          }
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }
    
    connectWithRetry()
  }
}

// Initialize connection handling
handleConnection()

// Graceful shutdown - only in Node.js runtime
if (typeof (globalThis as any).EdgeRuntime === 'undefined' && typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  if (process.on) {
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
    
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`
    
    // Test table access
    await prisma.user.count()
    
    const responseTime = Date.now() - startTime
    const connectionStatus = (prisma as any).getConnectionStatus()
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      connectionStatus,
      poolStatus: {
        // These would be available with pgbouncer
        active_connections: 'N/A',
        idle_connections: 'N/A',
        total_connections: 'N/A'
      },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    const connectionStatus = (prisma as any).getConnectionStatus()
    
    return {
      status: 'unhealthy',
      error: {
        message: error.message,
        code: error.code,
        meta: error.meta
      },
      connectionStatus,
      timestamp: new Date().toISOString()
    }
  }
}

// Export enhanced Prisma instance
export const enhancedPrisma = prisma as PrismaClientWithRetry
