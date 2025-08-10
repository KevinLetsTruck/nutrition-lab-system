import { NextRequest, NextResponse } from 'next/server'
// import { createServerSupabaseClient } from '@/lib/supabase'

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
        { error: `Failed to fetch protocol: ${error.message}` },
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
    const body = await request.json()
    const { content, status } = body
    
    console.log('Updating protocol:', resolvedParams.id, { content, status })
    
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
        { error: `Failed to update protocol: ${error.message}` },
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
    
    console.log('Deleting protocol:', resolvedParams.id)
    
    // First check if protocol exists
    const { data: existingProtocol, error: checkError } = await supabase
      .from('protocols')
      .select('id')
      .eq('id', resolvedParams.id)
      .single()

    if (checkError) {
      console.error('Error checking protocol existence:', checkError)
      return NextResponse.json(
        { error: `Protocol not found: ${checkError.message}` },
        { status: 404 }
      )
    }

    if (!existingProtocol) {
      return NextResponse.json(
        { error: 'Protocol not found' },
        { status: 404 }
      )
    }
    
    // Delete the protocol
    const { error } = await supabase
      .from('protocols')
      .delete()
      .eq('id', resolvedParams.id)

    if (error) {
      console.error('Error deleting protocol:', error)
      return NextResponse.json(
        { error: `Failed to delete protocol: ${error.message}` },
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