import { NextRequest, NextResponse } from 'next/server'
// import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const resolvedParams = await params
    
    // Get the lab report with client information
    const { data: report, error } = await supabase
      .from('lab_reports')
      .select(`
        *,
        client:clients(first_name, last_name, email)
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      console.error('Error fetching report:', error)
      return NextResponse.json(
        { error: 'Failed to fetch report' },
        { status: 500 }
      )
    }

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error in GET /api/reports/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const resolvedParams = await params
    
    // Delete the lab report
    const { error } = await supabase
      .from('lab_reports')
      .delete()
      .eq('id', resolvedParams.id)

    if (error) {
      console.error('Error deleting report:', error)
      return NextResponse.json(
        { error: 'Failed to delete report' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/reports/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 