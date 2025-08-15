import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'>;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  clientId?: string;
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
}
