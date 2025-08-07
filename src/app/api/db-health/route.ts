import { NextResponse } from 'next/server'
import { runDatabaseDiagnostic } from '@/lib/db/diagnostic'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Starting database health check...')
    
    const diagnostic = await runDatabaseDiagnostic()
    
    // Determine overall health status
    const isHealthy = 
      (diagnostic.connections.supabaseClient.success || 
       diagnostic.connections.supabaseServiceClient.success || 
       diagnostic.connections.postgresqlDirect.success) &&
      diagnostic.tables.found.length > 0

    const status = isHealthy ? 200 : 503
    
    // Add summary
    const summary = {
      healthy: isHealthy,
      workingConnections: [
        diagnostic.connections.supabaseClient.success && 'supabase-client',
        diagnostic.connections.supabaseServiceClient.success && 'supabase-service',
        diagnostic.connections.postgresqlDirect.success && 'postgresql-direct'
      ].filter(Boolean),
      tableStatus: `${diagnostic.tables.found.length} found, ${diagnostic.tables.missing.length} missing`,
      canRead: diagnostic.operations.read.success,
      canWrite: diagnostic.operations.write.success
    }
    
    return NextResponse.json(
      {
        summary,
        diagnostic,
        timestamp: new Date().toISOString()
      },
      { 
        status,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error: any) {
    console.error('Database health check error:', error)
    
    return NextResponse.json(
      {
        summary: {
          healthy: false,
          error: 'Diagnostic failed to run'
        },
        error: {
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
