import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth';
import { isMonth } from '@/app/lib/formatDate';
import {
  deleteExperience,
  getAllExperience,
  insertExperience,
  updateExperience,
  type ExperienceInput,
} from '@/app/lib/db';

const MODALITIES = ['On-site', 'Remote', 'Hybrid'];

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** Validates the request body; returns the clean input or an error message. */
function parse(body: Record<string, unknown>): { data: ExperienceInput } | { error: string } {
  const role = str(body.role);
  const company = str(body.company);
  const startDate = str(body.startDate);
  const current = body.current === true || body.current === 1;
  const endDate = current ? '' : str(body.endDate);
  const modality = str(body.modality);
  const description = typeof body.description === 'string' ? body.description.trim() : '';

  if (!role || !company) return { error: 'Job title and company are required.' };
  if (!isMonth(startDate)) return { error: 'Start date is required (YYYY-MM).' };
  if (!current) {
    if (!isMonth(endDate)) return { error: 'End date is required unless you currently work here.' };
    if (endDate < startDate) return { error: 'End date cannot be before the start date.' };
  }
  if (!MODALITIES.includes(modality)) return { error: 'Invalid work modality.' };

  return { data: { role, company, startDate, endDate, current: current ? 1 : 0, modality, description } };
}

export async function GET() {
  try {
    return NextResponse.json(getAllExperience());
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json({ error: 'Error fetching experience' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const parsed = parse(await request.json());
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json(
      { message: 'Experience added successfully', experience: insertExperience(parsed.data) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving experience:', error);
    return NextResponse.json({ error: 'Error saving to the database' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: 'Missing experience ID' }, { status: 400 });
    const parsed = parse(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json({
      message: 'Experience updated successfully',
      experience: updateExperience(id, parsed.data),
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Error updating the database' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Missing experience ID' }, { status: 400 });
    deleteExperience(id);
    return NextResponse.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Error deleting experience' }, { status: 500 });
  }
}
