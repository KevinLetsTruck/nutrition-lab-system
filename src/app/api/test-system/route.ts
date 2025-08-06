import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      envVars: false,
      supabaseConnection: false,
      databaseRead: false,
      databaseWrite: false,
      storageAccess: false
    },
    details: {} as any
  }

  // 1. Check environment variables
  try {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    results.checks.envVars = hasUrl && hasAnonKey
    results.details.envVars = {
      hasSupabaseUrl: hasUrl,
      hasSupabaseAnonKey: hasAnonKey,
      hasSupabaseServiceKey: hasServiceKey,
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0
    }
  } catch (error) {
    results.details.envVarsError = error instanceof Error ? error.message : 'Unknown error'
  }

  // 2. Test Supabase connection
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try a simple query
    const { error } = await supabase.from('clients').select('count').limit(1)
    results.checks.supabaseConnection = !error
    results.details.supabaseConnection = error ? { error: error.message } : { success: true }
  } catch (error) {
    results.details.supabaseConnectionError = error instanceof Error ? error.message : 'Unknown error'
  }

  // 3. Test database read (using DatabaseUtils)
  try {
    const clients = await db.searchClients('test@example.com')
    results.checks.databaseRead = true
    results.details.databaseRead = {
      success: true,
      clientsFound: clients.length
    }
  } catch (error) {
    results.details.databaseReadError = error instanceof Error ? error.message : 'Unknown error'
  }

  // 4. Test database write
  try {
    const testEmail = `test-${Date.now()}@example.com`
    const newClient = await db.createClient({
      email: testEmail,
      first_name: 'Test',
      last_name: 'Client'
    })
    
    if (newClient && newClient.id) {
      results.checks.databaseWrite = true
      results.details.databaseWrite = {
        success: true,
        testClientId: newClient.id,
        testEmail: testEmail
      }
      
      // Try to read it back
      const verifyClient = await db.getClientById(newClient.id)
      results.details.databaseVerify = {
        found: !!verifyClient,
        email: verifyClient?.email
      }
    }
  } catch (error) {
    results.details.databaseWriteError = error instanceof Error ? error.message : 'Unknown error'
  }

  // 5. Test storage buckets
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: buckets, error } = await supabase.storage.listBuckets()
    results.checks.storageAccess = !error && !!buckets
    results.details.storage = {
      error: error?.message,
      buckets: buckets?.map(b => b.name) || []
    }
  } catch (error) {
    results.details.storageError = error instanceof Error ? error.message : 'Unknown error'
  }

  // Summary
  const allPassed = Object.values(results.checks).every(check => check === true)
  
  return NextResponse.json({
    ...results,
    summary: {
      status: allPassed ? 'HEALTHY' : 'ISSUES DETECTED',
      passedChecks: Object.values(results.checks).filter(c => c).length,
      totalChecks: Object.keys(results.checks).length
    }
  }, {
    status: allPassed ? 200 : 503
  })
}