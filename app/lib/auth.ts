import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdmin } from '@/app/lib/db';

export const COOKIE_NAME = 'admin_token';
const SESSION_SECONDS = 60 * 60 * 8; // 8 hours

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');

function sign(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Signed token: base64url({exp, v}).hmac — bound to the current password version/secret. */
export function createToken(): string {
  const { tokenSecret, tokenVersion } = getAdmin();
  const payload = b64(JSON.stringify({ exp: Date.now() + SESSION_SECONDS * 1000, v: tokenVersion }));
  return `${payload}.${sign(payload, tokenSecret)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const { tokenSecret, tokenVersion } = getAdmin();
  const expected = Buffer.from(sign(payload, tokenSecret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return false;
  try {
    const { exp, v } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now() && v === tokenVersion;
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  return verifyToken((await cookies()).get(COOKIE_NAME)?.value);
}

/** For route handlers: returns a 401 response when not authenticated, otherwise null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function checkPassword(password: string): boolean {
  return bcrypt.compareSync(password, getAdmin().passwordHash);
}

export async function setSessionCookie() {
  (await cookies()).set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

// ── Brute-force protection (in-memory, single-process) ───────────────
const g = globalThis as unknown as { __loginAttempts?: { fails: number; lockedUntil: number } };
const attempts = (g.__loginAttempts ??= { fails: 0, lockedUntil: 0 });
const MAX_FAILS = 5;
const LOCK_MS = 60_000;

export function lockRemainingSeconds(): number {
  return Math.max(0, Math.ceil((attempts.lockedUntil - Date.now()) / 1000));
}

export function registerFailure() {
  attempts.fails += 1;
  if (attempts.fails >= MAX_FAILS) {
    attempts.lockedUntil = Date.now() + LOCK_MS;
    attempts.fails = 0;
  }
}

export function resetFailures() {
  attempts.fails = 0;
  attempts.lockedUntil = 0;
}
