import { NextResponse } from 'next/server';
import {
  checkPassword,
  lockRemainingSeconds,
  registerFailure,
  resetFailures,
  setSessionCookie,
} from '@/app/lib/auth';

export async function POST(request: Request) {
  const locked = lockRemainingSeconds();
  if (locked > 0) {
    return NextResponse.json(
      { error: `Too many attempts. Wait ${locked}s.` },
      { status: 429 }
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (typeof password !== 'string' || !checkPassword(password)) {
    registerFailure();
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  resetFailures();
  await setSessionCookie();
  return NextResponse.json({ ok: true });
}
