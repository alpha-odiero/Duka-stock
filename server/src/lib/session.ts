import jwt from 'jsonwebtoken';
import { env, SESSION_COOKIE, SESSION_MAX_AGE } from '../config/env';

export interface SessionPayload {
  userId: string;
  // issuedAt helps rotate/verify freshness
  iat: number;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, env.sessionSecret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, env.sessionSecret) as { userId: string };
    return { userId: payload.userId, iat: Date.now() };
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE,
    path: '/',
  };
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
