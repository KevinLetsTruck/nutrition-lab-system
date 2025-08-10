import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await params

    // Fetch client data
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Fetch notes for the client
    const notes = await prisma.clientNote.findMany({
      where: { clientId },
      include: {
        client: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ client, notes })
  } catch (error) {
    console.error('Error fetching client notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client notes' },
      { status: 500 }
    )
  }
}
