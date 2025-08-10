import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all clients with their profiles
    const users = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      },
      include: {
        clientProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to match the expected client format
    const clients = users.map(user => ({
      id: user.id,
      first_name: user.clientProfile?.firstName || '',
      last_name: user.clientProfile?.lastName || '',
      email: user.email,
      phone: user.clientProfile?.phone || '',
      status: 'active', // You can add status logic here
      archived_at: null, // Add archiving logic if needed
      created_at: user.createdAt.toISOString()
    }))

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}