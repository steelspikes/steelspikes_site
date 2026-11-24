import { NextResponse } from 'next/server';
import { isAdmin } from '@/app/lib/auth';

export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}
