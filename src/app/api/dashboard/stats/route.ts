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

    // Fetch clients count
    const totalClients = await prisma.client.count()
    
    const activeClients = await prisma.client.count({
      where: {
        archivedAt: null
      }
    })

    // Fetch today's assessments
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const assessmentsToday = await prisma.structuredAssessment.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    // Fetch pending reviews (mock for now)
    const pendingReviews = 0

    // Fetch protocols generated
    const protocolsGenerated = await prisma.protocol.count()

    // Calculate success rate (mock for now)
    const successRate = 92

    return NextResponse.json({
      totalClients,
      activeClients,
      assessmentsToday,
      pendingReviews,
      protocolsGenerated,
      successRate
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
