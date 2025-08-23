import { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export async function auth(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authenticated: false };
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    return {
      authenticated: true,
      user: payload,
    };
  } catch (error) {
    return { authenticated: false };
  }
}
