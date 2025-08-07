import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

export interface DatabaseDiagnosticResult {
  timestamp: string
  environment: {
    nodeEnv: string
    hasSupabaseUrl: boolean
    hasSupabaseAnonKey: boolean
    hasSupabaseServiceKey: boolean
    hasDatabaseUrl: boolean
    hasDirectUrl: boolean
    supabaseUrl?: string
    databaseUrl?: string
  }
  connections: {
    supabaseClient: {
      success: boolean
      error?: string
      testQuery?: any
    }
    supabaseServiceClient: {
      success: boolean
      error?: string
      testQuery?: any
    }
    postgresqlDirect: {
      success: boolean
      error?: string
      testQuery?: any
      connectionDetails?: {
        host: string
        port: string
        database: string
        ssl: boolean
      }
    }
  }
  tables: {
    found: string[]
    missing: string[]
    error?: string
  }
  operations: {
    read: {
      success: boolean
      error?: string
      rowCount?: number
    }
    write: {
      success: boolean
      error?: string
      testId?: string
    }
  }
  recommendations: string[]
}

const EXPECTED_TABLES = [
  'users',
  'client_profiles',
  'admin_profiles',
  'user_sessions',
  'email_verifications',
  'rate_limits'
]

export async function runDatabaseDiagnostic(): Promise<DatabaseDiagnosticResult> {
  const result: DatabaseDiagnosticResult = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...',
      databaseUrl: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@').substring(0, 60) + '...' : 
        undefined
    },
    connections: {
      supabaseClient: { success: false },
      supabaseServiceClient: { success: false },
      postgresqlDirect: { success: false }
    },
    tables: {
      found: [],
      missing: []
    },
    operations: {
      read: { success: false },
      write: { success: false }
    },
    recommendations: []
  }

  // Test 1: Supabase Anon Client
  if (result.environment.hasSupabaseUrl && result.environment.hasSupabaseAnonKey) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data, error } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true })
      
      if (error) {
        result.connections.supabaseClient.error = error.message
      } else {
        result.connections.supabaseClient.success = true
        result.connections.supabaseClient.testQuery = { rowCount: data }
      }
    } catch (e: any) {
      result.connections.supabaseClient.error = e.message
    }
  } else {
    result.connections.supabaseClient.error = 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
  }

  // Test 2: Supabase Service Client
  if (result.environment.hasSupabaseUrl && result.environment.hasSupabaseServiceKey) {
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('count(*)', { count: 'exact', head: true })
      
      if (error) {
        result.connections.supabaseServiceClient.error = error.message
      } else {
        result.connections.supabaseServiceClient.success = true
        result.connections.supabaseServiceClient.testQuery = { rowCount: data }
      }
    } catch (e: any) {
      result.connections.supabaseServiceClient.error = e.message
    }
  } else {
    result.connections.supabaseServiceClient.error = 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  }

  // Test 3: Direct PostgreSQL Connection
  if (result.environment.hasDatabaseUrl) {
    let pool: Pool | null = null
    try {
      const connectionString = process.env.DATABASE_URL!
      const url = new URL(connectionString)
      
      result.connections.postgresqlDirect.connectionDetails = {
        host: url.hostname,
        port: url.port || '5432',
        database: url.pathname.slice(1).split('?')[0],
        ssl: connectionString.includes('sslmode=require') || url.hostname.includes('supabase')
      }
      
      pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
        max: 1
      })
      
      const client = await pool.connect()
      
      try {
        const result2 = await client.query('SELECT COUNT(*) FROM pg_tables WHERE schemaname = $1', ['public'])
        result.connections.postgresqlDirect.success = true
        result.connections.postgresqlDirect.testQuery = { 
          tableCount: parseInt(result2.rows[0].count)
        }
        
        // Get list of tables
        const tablesResult = await client.query(
          "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        )
        const foundTables = tablesResult.rows.map(row => row.tablename)
        
        result.tables.found = foundTables
        result.tables.missing = EXPECTED_TABLES.filter(table => !foundTables.includes(table))
        
      } finally {
        client.release()
      }
    } catch (e: any) {
      result.connections.postgresqlDirect.error = `${e.code || 'ERROR'}: ${e.message}`
    } finally {
      if (pool) {
        await pool.end()
      }
    }
  } else {
    result.connections.postgresqlDirect.error = 'DATABASE_URL not configured'
  }

  // Test 4: Read Operation (use whichever connection works)
  const workingClient = result.connections.supabaseServiceClient.success ? 
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    ) : 
    result.connections.supabaseClient.success ?
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ) : null

  if (workingClient && result.tables.found.includes('users')) {
    try {
      const { data, error, count } = await workingClient
        .from('users')
        .select('id, email', { count: 'exact' })
        .limit(5)
      
      if (error) {
        result.operations.read.error = error.message
      } else {
        result.operations.read.success = true
        result.operations.read.rowCount = count || 0
      }
    } catch (e: any) {
      result.operations.read.error = e.message
    }
  } else {
    result.operations.read.error = 'No working connection or users table not found'
  }

  // Test 5: Write Operation (create and delete a test record)
  if (workingClient && result.tables.found.includes('rate_limits')) {
    try {
      const testId = `test-${Date.now()}`
      
      // Insert
      const { error: insertError } = await workingClient
        .from('rate_limits')
        .insert({
          identifier: testId,
          action: 'diagnostic_test',
          attempts: 1
        })
      
      if (insertError) {
        result.operations.write.error = `Insert failed: ${insertError.message}`
      } else {
        // Delete
        const { error: deleteError } = await workingClient
          .from('rate_limits')
          .delete()
          .eq('identifier', testId)
        
        if (deleteError) {
          result.operations.write.error = `Delete failed: ${deleteError.message}`
        } else {
          result.operations.write.success = true
          result.operations.write.testId = testId
        }
      }
    } catch (e: any) {
      result.operations.write.error = e.message
    }
  } else {
    result.operations.write.error = 'No working connection or rate_limits table not found'
  }

  // Generate recommendations
  if (!result.connections.supabaseClient.success && !result.connections.supabaseServiceClient.success && !result.connections.postgresqlDirect.success) {
    result.recommendations.push('CRITICAL: No database connections are working')
    result.recommendations.push('Check if Supabase project is active (not paused)')
    result.recommendations.push('Verify all environment variables are correctly set in Railway')
    result.recommendations.push('Consider using Railway PostgreSQL addon instead of external Supabase')
  }

  if (result.connections.postgresqlDirect.success && !result.connections.supabaseClient.success) {
    result.recommendations.push('Direct PostgreSQL works but Supabase client fails - possible Supabase service issue')
    result.recommendations.push('Check Supabase dashboard for any service outages')
  }

  if (result.connections.postgresqlDirect.error?.includes('ETIMEDOUT') || result.connections.postgresqlDirect.error?.includes('ECONNREFUSED')) {
    result.recommendations.push('Network connectivity issue between Railway and Supabase')
    result.recommendations.push('Try using direct connection string without pooler')
    result.recommendations.push('Consider migrating to Railway PostgreSQL for better connectivity')
  }

  if (result.tables.missing.length > 0) {
    result.recommendations.push(`Missing tables: ${result.tables.missing.join(', ')}`)
    result.recommendations.push('Run the database migration scripts')
  }

  if (result.environment.hasDatabaseUrl && result.environment.databaseUrl?.includes('pooler')) {
    result.recommendations.push('Using pooled connection - try direct connection for better reliability')
    result.recommendations.push('Replace "pooler.supabase.com:6543" with "db.supabase.co:5432" in DATABASE_URL')
  }

  return result
}
