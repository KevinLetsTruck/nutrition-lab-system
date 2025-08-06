import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')
  const email = searchParams.get('email') || 'kevin2@letstruck.com'
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // Find all lab reports that might belong to this client
    const { data: allReports } = await supabase
      .from('lab_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    // Find reports that might be orphaned (created today)
    const today = new Date().toISOString().split('T')[0]
    const recentReports = allReports?.filter(r => 
      r.created_at.startsWith(today) || 
      r.notes?.includes(email) ||
      r.notes?.includes('kevin')
    ) || []
    
    // If we have a specific client ID, update the orphaned reports
    if (clientId && recentReports.length > 0) {
      const reportIds = recentReports.map(r => r.id)
      
      const { error: updateError } = await supabase
        .from('lab_reports')
        .update({ client_id: clientId })
        .in('id', reportIds)
      
      if (!updateError) {
        return NextResponse.json({
          success: true,
          message: `Fixed ${reportIds.length} orphaned documents`,
          updatedReports: reportIds,
          clientId
        })
      }
    }
    
    // Return diagnostic info
    return NextResponse.json({
      clientId,
      email,
      totalReports: allReports?.length || 0,
      orphanedReports: recentReports.length,
      recentReports: recentReports.map(r => ({
        id: r.id,
        client_id: r.client_id,
        created_at: r.created_at,
        file_path: r.file_path,
        notes: r.notes
      }))
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fix documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}