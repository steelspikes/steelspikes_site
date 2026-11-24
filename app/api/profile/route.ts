import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth';
import { getProfile, updateProfile } from '@/app/lib/db';

export async function GET() {
  try {
    const profile = getProfile();
    return NextResponse.json({
      ...profile,
      socialLinks: JSON.parse(profile.socialLinks || '{}'),
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Error fetching profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { name, role, heroSubtitle, avatarUrl, cvUrl, musicIntro, socialLinks } = body;

    if (!name || !role || !heroSubtitle) {
      return NextResponse.json(
        { error: 'Name, role and description are required.' },
        { status: 400 }
      );
    }

    const updated = updateProfile({
      name: name.trim(),
      role: role.trim(),
      heroSubtitle: heroSubtitle.trim(),
      avatarUrl: avatarUrl ? avatarUrl.trim() : '',
      cvUrl: cvUrl ? cvUrl.trim() : '',
      musicIntro: musicIntro ? musicIntro.trim() : '',
      socialLinks: typeof socialLinks === 'object' && socialLinks !== null ? socialLinks : {},
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        ...updated,
        socialLinks: JSON.parse(updated.socialLinks || '{}'),
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error saving to the database' }, { status: 500 });
  }
}
