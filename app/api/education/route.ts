import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth';
import { isMonth } from '@/app/lib/formatDate';
import {
  deleteEducation,
  getAllEducation,
  insertEducation,
  updateEducation,
  type EducationInput,
} from '@/app/lib/db';

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function parse(body: Record<string, unknown>): { data: EducationInput } | { error: string } {
  const degree = str(body.degree);
  const institution = str(body.institution);
  const startDate = str(body.startDate);
  const current = body.current === true || body.current === 1;
  const endDate = current ? '' : str(body.endDate);
  const description = str(body.description);

  if (!degree || !institution) return { error: 'Degree and institution are required.' };
  if (!isMonth(startDate)) return { error: 'Start date is required (YYYY-MM).' };
  if (!current) {
    if (!isMonth(endDate)) return { error: 'End date is required unless you are still studying.' };
    if (endDate < startDate) return { error: 'End date cannot be before the start date.' };
  }
  return { data: { degree, institution, startDate, endDate, current: current ? 1 : 0, description } };
}

export async function GET() {
  try {
    return NextResponse.json(getAllEducation());
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json({ error: 'Error fetching education' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const parsed = parse(await request.json());
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json(
      { message: 'Education added successfully', education: insertEducation(parsed.data) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving education:', error);
    return NextResponse.json({ error: 'Error saving to the database' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: 'Missing education ID' }, { status: 400 });
    const parsed = parse(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json({
      message: 'Education updated successfully',
      education: updateEducation(id, parsed.data),
    });
  } catch (error) {
    console.error('Error updating education:', error);
    return NextResponse.json({ error: 'Error updating the database' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Missing education ID' }, { status: 400 });
    deleteEducation(id);
    return NextResponse.json({ message: 'Education deleted successfully' });
  } catch (error) {
    console.error('Error deleting education:', error);
    return NextResponse.json({ error: 'Error deleting education' }, { status: 500 });
  }
}
