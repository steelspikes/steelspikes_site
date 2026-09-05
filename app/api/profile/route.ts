import { NextResponse } from 'next/server';
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
    return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, role, heroSubtitle, avatarUrl, cvUrl, musicIntro, socialLinks } = body;

    if (!name || !role || !heroSubtitle) {
      return NextResponse.json(
        { error: 'Nombre, Rol y Descripción son campos obligatorios.' },
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
      message: 'Perfil general actualizado con éxito',
      profile: {
        ...updated,
        socialLinks: JSON.parse(updated.socialLinks || '{}'),
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error al guardar en la base de datos' }, { status: 500 });
  }
}
