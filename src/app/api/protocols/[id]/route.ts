import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const resolvedParams = await params
    
    // Delete the protocol
    const { error } = await supabase
      .from('protocols')
      .delete()
      .eq('id', resolvedParams.id)

    if (error) {
      console.error('Error deleting protocol:', error)
      return NextResponse.json(
        { error: 'Failed to delete protocol' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/protocols/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 