import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

/**
 * GET /api/auth/verify
 * Verify if the provided auth token is valid
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the token
    const authUser = await verifyAuthToken(request);
    
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        role: authUser.role,
      },
      message: "Token is valid",
    });

  } catch (error: any) {
    console.log('Token verification failed:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Token validation failed",
        details: error.message 
      },
      { status: 401 }
    );
  }
}
