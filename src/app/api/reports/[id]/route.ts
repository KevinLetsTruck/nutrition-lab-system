import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { id: reportId } = await params
    
    // Delete the lab report
    const { error } = await supabase
      .from('lab_reports')
      .delete()
      .eq('id', reportId)
    
    if (error) {
      console.error('Error deleting report:', error)
      return NextResponse.json(
        { error: 'Failed to delete report' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    })
    
  } catch (error) {
    console.error('Error in delete report API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 