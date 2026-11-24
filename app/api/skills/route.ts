import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth';
import {
  deleteSkillGroup,
  getAllSkillGroups,
  insertSkillGroup,
  reorderSkillGroups,
  updateSkillGroup,
  type SkillGroupInput,
} from '@/app/lib/db';

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function parse(body: Record<string, unknown>): { data: SkillGroupInput } | { error: string } {
  const title = str(body.title);
  const description = str(body.description);
  const icon = str(body.icon) || 'Server';

  if (!title) return { error: 'Group name is required.' };
  if (!/^[A-Za-z0-9]{1,40}$/.test(icon)) return { error: 'Invalid icon.' };
  if (!Array.isArray(body.skills)) return { error: 'Skills must be a list.' };

  // Trim, drop empties and case-insensitive duplicates
  const seen = new Set<string>();
  const skills: string[] = [];
  for (const raw of body.skills) {
    const name = str(raw).slice(0, 40);
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      skills.push(name);
    }
  }
  return { data: { icon, title, description, skills } };
}

const format = (g: ReturnType<typeof getAllSkillGroups>[number]) => ({
  ...g,
  skills: JSON.parse(g.skills || '[]') as string[],
});

export async function GET() {
  try {
    return NextResponse.json(getAllSkillGroups().map(format));
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Error fetching skills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const parsed = parse(await request.json());
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json(
      { message: 'Skill group added successfully', group: format(insertSkillGroup(parsed.data)) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving skill group:', error);
    return NextResponse.json({ error: 'Error saving to the database' }, { status: 500 });
  }
}

/** Update a group, or reorder all groups when the body is `{ order: number[] }`. */
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();

    if (Array.isArray(body.order)) {
      const ids = body.order.map(Number);
      if (ids.some((n: number) => !Number.isInteger(n))) {
        return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
      }
      reorderSkillGroups(ids);
      return NextResponse.json({ message: 'Order updated' });
    }

    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: 'Missing group ID' }, { status: 400 });
    const parsed = parse(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json({
      message: 'Skill group updated successfully',
      group: format(updateSkillGroup(id, parsed.data)),
    });
  } catch (error) {
    console.error('Error updating skill group:', error);
    return NextResponse.json({ error: 'Error updating the database' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Missing group ID' }, { status: 400 });
    deleteSkillGroup(id);
    return NextResponse.json({ message: 'Skill group deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill group:', error);
    return NextResponse.json({ error: 'Error deleting skill group' }, { status: 500 });
  }
}
