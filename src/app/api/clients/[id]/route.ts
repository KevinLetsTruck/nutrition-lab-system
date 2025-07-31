import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const resolvedParams = await params
    
    // Get the client
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      console.error('Error fetching client:', error)
      return NextResponse.json(
        { error: 'Failed to fetch client' },
        { status: 500 }
      )
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Error in GET /api/clients/[id]:', error)
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
    const { status, archived_at } = await request.json()
    
    // Update the client
    const { data, error } = await supabase
      .from('clients')
      .update({ 
        status: status || undefined,
        archived_at: archived_at || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      )
    }

    return NextResponse.json({ client: data })
  } catch (error) {
    console.error('Error in PUT /api/clients/[id]:', error)
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
    
    // Delete the client and all related data
    const { error: clientError } = await supabase
      .from('clients')
      .delete()
      .eq('id', resolvedParams.id)

    if (clientError) {
      console.error('Error deleting client:', clientError)
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: 500 }
      )
    }

    // Also delete related data (notes, protocols, lab reports)
    // Note: This is a soft delete approach - you might want to keep some data for records
    const { error: notesError } = await supabase
      .from('client_notes')
      .delete()
      .eq('client_id', resolvedParams.id)

    if (notesError) {
      console.error('Error deleting client notes:', notesError)
    }

    const { error: protocolsError } = await supabase
      .from('protocols')
      .delete()
      .eq('client_id', resolvedParams.id)

    if (protocolsError) {
      console.error('Error deleting client protocols:', protocolsError)
    }

    const { error: reportsError } = await supabase
      .from('lab_reports')
      .delete()
      .eq('client_id', resolvedParams.id)

    if (reportsError) {
      console.error('Error deleting client lab reports:', reportsError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/clients/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 