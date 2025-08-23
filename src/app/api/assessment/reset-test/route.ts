import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    // Find test client
    const testClient = await prisma.client.findFirst({
      where: { email: "test@example.com" }
    });

    if (!testClient) {
      return NextResponse.json({
        success: false,
        error: "Test client not found"
      });
    }

    // Delete all assessments for test client
    const deleted = await prisma.clientAssessment.deleteMany({
      where: { clientId: testClient.id }
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} assessments for test client`,
      clientId: testClient.id
    });

  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset"
    }, { status: 500 });
  }
}
