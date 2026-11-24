import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth';
import {
  deleteProject,
  getAllProjects,
  insertProject,
  reorderProjects,
  updateProject,
  type ProjectInput,
} from '@/app/lib/db';

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const isHttp = (v: string) => /^https?:\/\//i.test(v);

function parse(body: Record<string, unknown>): { data: ProjectInput } | { error: string } {
  const title = str(body.title);
  const description = str(body.description);
  const githubUrl = str(body.githubUrl);
  const liveUrl = str(body.liveUrl);
  const imageUrl = str(body.imageUrl);

  if (!title) return { error: 'Project name is required.' };
  // Only http(s) links (blocks javascript: etc.). Empty is allowed: the link is simply not shown.
  for (const [label, url] of [
    ['GitHub', githubUrl],
    ['Live demo', liveUrl],
    ['Image', imageUrl],
  ] as const) {
    if (url && !isHttp(url)) return { error: `${label} URL must start with http:// or https://.` };
  }

  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of Array.isArray(body.tags) ? body.tags : []) {
    const tag = str(raw).slice(0, 40);
    if (tag && !seen.has(tag.toLowerCase())) {
      seen.add(tag.toLowerCase());
      tags.push(tag);
    }
  }
  return { data: { title, description, tags, githubUrl, liveUrl, imageUrl } };
}

const format = (p: ReturnType<typeof getAllProjects>[number]) => ({
  ...p,
  tags: JSON.parse(p.tags || '[]') as string[],
});

export async function GET() {
  try {
    return NextResponse.json(getAllProjects().map(format));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const parsed = parse(await request.json());
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json(
      { message: 'Project added successfully', project: format(insertProject(parsed.data)) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving project:', error);
    return NextResponse.json({ error: 'Error saving to the database' }, { status: 500 });
  }
}

/** Update a project, or reorder all projects when the body is `{ order: number[] }`. */
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
      reorderProjects(ids);
      return NextResponse.json({ message: 'Order updated' });
    }

    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    const parsed = parse(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    return NextResponse.json({
      message: 'Project updated successfully',
      project: format(updateProject(id, parsed.data)),
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Error updating the database' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    deleteProject(id);
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Error deleting project' }, { status: 500 });
  }
}
