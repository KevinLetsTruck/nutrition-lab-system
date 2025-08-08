import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where = clientId ? { clientId } : {}

    // Get lab results with client info
    const [labResults, total] = await Promise.all([
      prisma.labReport.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          nutriqResult: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.labReport.count({ where })
    ])

    // Transform to match expected format
    const data = labResults.map(result => ({
      ...result,
      first_name: result.client.firstName,
      last_name: result.client.lastName,
      email: result.client.email,
      clients: result.client
    }))

    return NextResponse.json({
      success: true,
      data,
      total,
      limit,
      offset
    })

  } catch (error) {
    console.error('Lab results fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}