import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('id')
  const email = searchParams.get('email')
  
  if (!clientId && !email) {
    return NextResponse.json({ error: 'Provide id or email parameter' }, { status: 400 })
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const results = {
    timestamp: new Date().toISOString(),
    searchParams: { clientId, email },
    clients: {
      inClientsTable: null as any,
      inUsersTable: null as any
    },
    labReports: [] as any[],
    storage: {
      files: [] as any[]
    }
  }
  
  try {
    // Check clients table
    if (clientId) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
      
      results.clients.inClientsTable = clientData
    }
    
    if (email) {
      const { data: clientByEmail } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .single()
      
      if (clientByEmail && !results.clients.inClientsTable) {
        results.clients.inClientsTable = clientByEmail
      }
    }
    
    // Check users table
    if (email) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      results.clients.inUsersTable = userData
    }
    
    // Get lab reports for all possible client IDs
    const possibleIds = [
      clientId,
      results.clients.inClientsTable?.id,
      results.clients.inUsersTable?.id
    ].filter(Boolean)
    
    for (const id of possibleIds) {
      const { data: reports } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
      
      if (reports && reports.length > 0) {
        results.labReports.push(...reports.map(r => ({
          ...r,
          searched_with_id: id
        })))
      }
    }
    
    // Check storage for recent files
    const { data: buckets } = await supabase.storage.listBuckets()
    
    for (const bucket of buckets || []) {
      const { data: files } = await supabase.storage
        .from(bucket.name)
        .list('', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } })
      
      if (files && files.length > 0) {
        results.storage.files.push({
          bucket: bucket.name,
          recentFiles: files.slice(0, 5).map(f => ({
            name: f.name,
            size: f.metadata?.size,
            created: f.created_at
          }))
        })
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error)
  }
  
  return NextResponse.json({
    ...results,
    summary: {
      hasClientRecord: !!results.clients.inClientsTable,
      hasUserRecord: !!results.clients.inUsersTable,
      labReportCount: results.labReports.length,
      uniqueClientIds: [...new Set(results.labReports.map(r => r.client_id))]
    }
  })
}