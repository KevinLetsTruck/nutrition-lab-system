import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const resolvedParams = await params
    
    // Get the protocol with client information
    const { data: protocol, error } = await supabase
      .from('protocols')
      .select(`
        *,
        client:clients(first_name, last_name, email)
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      console.error('Error fetching protocol:', error)
      return NextResponse.json(
        { error: 'Failed to fetch protocol' },
        { status: 500 }
      )
    }

    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocol not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ protocol })
  } catch (error) {
    console.error('Error in GET /api/protocols/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const resolvedParams = await params
    const { content, status } = await request.json()
    
    // Update the protocol
    const { data, error } = await supabase
      .from('protocols')
      .update({ 
        content: content || undefined,
        status: status || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating protocol:', error)
      return NextResponse.json(
        { error: 'Failed to update protocol' },
        { status: 500 }
      )
    }

    return NextResponse.json({ protocol: data })
  } catch (error) {
    console.error('Error in PUT /api/protocols/[id]:', error)
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