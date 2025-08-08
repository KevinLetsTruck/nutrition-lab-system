import { prisma, checkDatabaseHealth, enhancedPrisma } from '@/lib/prisma'
import { performance } from 'perf_hooks'

interface ConnectionTestResult {
  testName: string
  success: boolean
  duration: number
  error?: string
  details?: any
}

export class DatabaseConnectionTester {
  private results: ConnectionTestResult[] = []
  
  /**
   * Run all connection tests
   */
  async runAllTests(): Promise<{
    summary: {
      totalTests: number
      passed: number
      failed: number
      totalDuration: number
      timestamp: Date
    }
    tests: ConnectionTestResult[]
    health: any
  }> {
    console.log('🧪 Starting database connection tests...\n')
    
    // Clear previous results
    this.results = []
    
    // Run tests
    await this.testBasicConnection()
    await this.testQueryExecution()
    await this.testWriteOperation()
    await this.testTransactionOperation()
    await this.testConcurrentQueries()
    await this.testConnectionRecovery()
    await this.testLargeQuery()
    
    // Get health check
    const health = await checkDatabaseHealth()
    
    // Calculate summary
    const summary = {
      totalTests: this.results.length,
      passed: this.results.filter(r => r.success).length,
      failed: this.results.filter(r => !r.success).length,
      totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
      timestamp: new Date()
    }
    
    console.log('\n📊 Test Summary:')
    console.log(`Total: ${summary.totalTests}, Passed: ${summary.passed}, Failed: ${summary.failed}`)
    console.log(`Total Duration: ${summary.totalDuration.toFixed(2)}ms`)
    console.log(`Health Status: ${health.status}`)
    
    return {
      summary,
      tests: this.results,
      health
    }
  }
  
  /**
   * Test basic database connection
   */
  private async testBasicConnection(): Promise<void> {
    const startTime = performance.now()
    const testName = 'Basic Connection'
    
    try {
      await prisma.$queryRaw`SELECT 1`
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: true,
        duration,
        details: { message: 'Successfully connected to database' }
      })
      
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms`)
    } catch (error: any) {
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: false,
        duration,
        error: error.message,
        details: { code: error.code, meta: error.meta }
      })
      
      console.log(`❌ ${testName} - Failed: ${error.message}`)
    }
  }
  
  /**
   * Test query execution
   */
  private async testQueryExecution(): Promise<void> {
    const startTime = performance.now()
    const testName = 'Query Execution'
    
    try {
      const userCount = await prisma.user.count()
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: true,
        duration,
        details: { userCount }
      })
      
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms (${userCount} users)`)
    } catch (error: any) {
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: false,
        duration,
        error: error.message
      })
      
      console.log(`❌ ${testName} - Failed: ${error.message}`)
    }
  }
  
  /**
   * Test write operation
   */
  private async testWriteOperation(): Promise<void> {
    const startTime = performance.now()
    const testName = 'Write Operation'
    
    try {
      // Create a test note
      const note = await prisma.note.create({
        data: {
          clientId: 'test-connection-' + Date.now(),
          authorId: 'test-author-' + Date.now(),
          content: 'Connection test note',
          category: 'test'
        }
      })
      
      // Clean up
      await prisma.note.delete({
        where: { id: note.id }
      })
      
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: true,
        duration,
        details: { operation: 'create and delete' }
      })
      
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms`)
    } catch (error: any) {
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: false,
        duration,
        error: error.message
      })
      
      console.log(`❌ ${testName} - Failed: ${error.message}`)
    }
  }
  
  /**
   * Test transaction operation
   */
  private async testTransactionOperation(): Promise<void> {
    const startTime = performance.now()
    const testName = 'Transaction Operation'
    
    try {
      await prisma.$transaction(async (tx) => {
        // Count users
        const userCount = await tx.user.count()
        
        // Count clients
        const clientCount = await tx.client.count()
        
        return { userCount, clientCount }
      })
      
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: true,
        duration,
        details: { message: 'Transaction completed successfully' }
      })
      
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms`)
    } catch (error: any) {
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: false,
        duration,
        error: error.message
      })
      
      console.log(`❌ ${testName} - Failed: ${error.message}`)
    }
  }
  
  /**
   * Test concurrent queries
   */
  private async testConcurrentQueries(): Promise<void> {
    const startTime = performance.now()
    const testName = 'Concurrent Queries'
    
    try {
      // Run 10 queries concurrently
      const promises = Array(10).fill(null).map((_, i) => 
        prisma.$queryRaw`SELECT ${i} as query_id, NOW() as timestamp`
      )
      
      await Promise.all(promises)
      
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: true,
        duration,
        details: { queriesRun: 10 }
      })
      
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms (10 concurrent queries)`)
    } catch (error: any) {
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: false,
        duration,
        error: error.message
      })
      
      console.log(`❌ ${testName} - Failed: ${error.message}`)
    }
  }
  
  /**
   * Test connection recovery
   */
  private async testConnectionRecovery(): Promise<void> {
    const startTime = performance.now()
    const testName = 'Connection Recovery'
    
    try {
      // Force disconnect and reconnect
      await prisma.$disconnect()
      await new Promise(resolve => setTimeout(resolve, 100))
      await prisma.$connect()
      
      // Test query after reconnect
      await prisma.$queryRaw`SELECT 1`
      
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: true,
        duration,
        details: { message: 'Successfully recovered connection' }
      })
      
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms`)
    } catch (error: any) {
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: false,
        duration,
        error: error.message
      })
      
      console.log(`❌ ${testName} - Failed: ${error.message}`)
    }
  }
  
  /**
   * Test large query
   */
  private async testLargeQuery(): Promise<void> {
    const startTime = performance.now()
    const testName = 'Large Query Performance'
    
    try {
      // Get multiple records with relations
      const clients = await prisma.client.findMany({
        take: 100,
        include: {
          labReports: {
            take: 5
          },
          notes: {
            take: 5
          }
        }
      })
      
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: true,
        duration,
        details: { 
          recordsRetrieved: clients.length,
          avgTimePerRecord: clients.length > 0 ? duration / clients.length : 0
        }
      })
      
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms (${clients.length} records)`)
    } catch (error: any) {
      const duration = performance.now() - startTime
      
      this.results.push({
        testName,
        success: false,
        duration,
        error: error.message
      })
      
      console.log(`❌ ${testName} - Failed: ${error.message}`)
    }
  }
  
  /**
   * Check for connection leaks
   */
  static async checkConnectionLeaks(): Promise<{
    hasLeaks: boolean
    details: any
  }> {
    try {
      // Get current connection status
      const status = enhancedPrisma.getConnectionStatus()
      
      // Run some queries
      for (let i = 0; i < 20; i++) {
        await prisma.$queryRaw`SELECT ${i}`
      }
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check status again
      const newStatus = enhancedPrisma.getConnectionStatus()
      
      return {
        hasLeaks: newStatus.attempts > status.attempts + 5,
        details: {
          before: status,
          after: newStatus
        }
      }
    } catch (error) {
      return {
        hasLeaks: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }
}

// Export a singleton instance
export const connectionTester = new DatabaseConnectionTester()

// CLI interface for running tests
if (require.main === module) {
  connectionTester.runAllTests()
    .then(results => {
      console.log('\n📋 Full Results:', JSON.stringify(results, null, 2))
      process.exit(results.summary.failed > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('Test runner failed:', error)
      process.exit(1)
    })
}
