import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth';
import { isMonth } from '@/app/lib/formatDate';
import {
  deleteCertification,
  getAllCertifications,
  insertCertification,
  updateCertification,
  type CertificationInput,
} from '@/app/lib/db';

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function parse(body: Record<string, unknown>): { data: CertificationInput } | { error: string } {
  const name = str(body.name);
  const issuer = str(body.issuer);
  const issueDate = str(body.issueDate);
  const noExpiration = body.noExpiration === true;
  const expirationDate = noExpiration ? '' : str(body.expirationDate);
  const credentialUrl = str(body.credentialUrl);

  if (!name || !issuer) return { error: 'Certification name and issuer are required.' };
  if (!isMonth(issueDate)) return { error: 'Issue date is required (YYYY-MM).' };
  if (expirationDate) {
    if (!isMonth(expirationDate)) return { error: 'Invalid expiration date.' };
    if (expirationDate < issueDate) return { error: 'Expiration date cannot be before the issue date.' };
  }
  // Only http(s) links (blocks javascript: etc.)
  if (credentialUrl && !/^https?:\/\//i.test(credentialUrl)) {
    return { error: 'Credential URL must start with http:// or https://.' };
  }
  return { data: { name, issuer, issueDate, expirationDate, credentialUrl } };
}

export async function GET() {
  try {
    return NextResponse.json(getAllCertifications());
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json({ error: 'Error fetching certifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const parsed = parse(await request.json());
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json(
      { message: 'Certification added successfully', certification: insertCertification(parsed.data) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving certification:', error);
    return NextResponse.json({ error: 'Error saving to the database' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: 'Missing certification ID' }, { status: 400 });
    const parsed = parse(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json({
      message: 'Certification updated successfully',
      certification: updateCertification(id, parsed.data),
    });
  } catch (error) {
    console.error('Error updating certification:', error);
    return NextResponse.json({ error: 'Error updating the database' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Missing certification ID' }, { status: 400 });
    deleteCertification(id);
    return NextResponse.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json({ error: 'Error deleting certification' }, { status: 500 });
  }
}
