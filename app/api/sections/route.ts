import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth';
import { getSectionTexts, saveSectionTexts } from '@/app/lib/db';
import { SECTION_KEYS, SECTION_TEXT_MAX } from '@/app/lib/sectionTexts';

/** Public: every section subtext (stored override, or the built-in default). */
export async function GET() {
  try {
    return NextResponse.json(getSectionTexts());
  } catch (error) {
    console.error('Error fetching section texts:', error);
    return NextResponse.json({ error: 'Error fetching section texts' }, { status: 500 });
  }
}

/** Admin: body `{ texts: { [sectionKey]: string } }`. An empty string hides that subtext. */
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const texts = body?.texts;
    if (typeof texts !== 'object' || texts === null || Array.isArray(texts)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(texts)) {
      if (!SECTION_KEYS.includes(key)) {
        return NextResponse.json({ error: `Unknown section "${key}".` }, { status: 400 });
      }
      if (typeof value !== 'string') {
        return NextResponse.json({ error: 'Subtext must be text.' }, { status: 400 });
      }
      const text = value.trim();
      if (text.length > SECTION_TEXT_MAX) {
        return NextResponse.json(
          { error: `Subtext must be ${SECTION_TEXT_MAX} characters or fewer.` },
          { status: 400 }
        );
      }
      clean[key] = text;
    }

    saveSectionTexts(clean);
    return NextResponse.json({ message: 'Section texts saved', texts: getSectionTexts() });
  } catch (error) {
    console.error('Error saving section texts:', error);
    return NextResponse.json({ error: 'Error saving to the database' }, { status: 500 });
  }
}
