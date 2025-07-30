import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get count of pending reports first
    const { count } = await supabase
      .from('lab_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    // Delete all pending reports
    const { error } = await supabase
      .from('lab_reports')
      .delete()
      .eq('status', 'pending')
    
    if (error) {
      console.error('Error clearing pending reports:', error)
      return NextResponse.json(
        { error: 'Failed to clear pending reports' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      deleted: count || 0,
      message: `Cleared ${count || 0} pending reports`
    })
    
  } catch (error) {
    console.error('Error in clear pending reports API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 