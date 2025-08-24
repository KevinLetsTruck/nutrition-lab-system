import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface AuthSession {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Verifies the JWT token from the request and returns the user session
 * This mimics the NextAuth auth() function pattern for consistency
 */
export async function auth(request?: NextRequest): Promise<AuthSession | null> {
  // If no request is provided, we can't authenticate
  if (!request) {
    return null;
  }

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    // Basic JWT format validation
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

      return {
    user: {
      id: payload.clientId || payload.userId, // Use clientId if available, otherwise userId
      email: payload.email,
      role: payload.role,
    }
  };
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}
