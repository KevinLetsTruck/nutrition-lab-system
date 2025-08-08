import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all lab reports with client information
    const reports = await prisma.labReport.findMany({
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
      }
    })
    
    // Transform the data to match expected format
    const transformedReports = reports.map(report => ({
      ...report,
      first_name: report.client.firstName,
      last_name: report.client.lastName,
      clients: {
        id: report.client.id,
        first_name: report.client.firstName,
        last_name: report.client.lastName,
        email: report.client.email
      }
    }))
    
    return NextResponse.json({
      success: true,
      reports: transformedReports
    })
    
  } catch (error) {
    console.error('Error in reports API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 