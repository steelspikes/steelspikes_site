import { NextResponse } from 'next/server';
import { checkPassword, requireAdmin, setSessionCookie } from '@/app/lib/auth';
import { setAdminPassword } from '@/app/lib/db';

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { currentPassword, newPassword } = body;

  if (typeof currentPassword !== 'string' || !checkPassword(currentPassword)) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 4 || newPassword.length > 72) {
    return NextResponse.json(
      { error: 'New password must be between 4 and 72 characters' },
      { status: 400 }
    );
  }

  setAdminPassword(newPassword);
  // Old tokens are now invalid; issue a fresh one for this session.
  await setSessionCookie();
  return NextResponse.json({ message: 'Password updated' });
}
