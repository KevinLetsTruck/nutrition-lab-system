import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import type {
  JWTPayload,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "@/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export async function register({
  email,
  password,
  name,
}: RegisterData): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  // Create user with CLIENT role
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "CLIENT",
    },
  });

  // Also create a Client record for assessment purposes
  const client = await prisma.client.create({
    data: {
      email,
      firstName: name.split(" ")[0] || name,
      lastName: name.split(" ").slice(1).join(" ") || "",
      phone: "",
      status: "ACTIVE",
    },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    clientId: client.id,
  });

  const { password: _, ...safeUser } = user;

  return {
    user: { ...safeUser, clientId: client.id },
    token,
  };
}

export async function login({
  email,
  password,
}: LoginCredentials): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  // Find associated client record if user is a CLIENT
  let clientId = user.id; // Default to user ID
  if (user.role === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { email: user.email },
    });
    if (client) {
      clientId = client.id;
    }
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    clientId: clientId, // Include client ID in token
  });

  const { password: _, ...safeUser } = user;

  return {
    user: { ...safeUser, clientId },
    token,
  };
}

export async function getUserFromToken(token: string) {
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
