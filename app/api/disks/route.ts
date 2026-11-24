import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth';
import { isIsoDate } from '@/app/lib/formatDate';
import { getAllAlbums, insertAlbum, deleteAlbum, updateAlbum } from '@/app/lib/db';

/** Trims and only accepts http(s) links (blocks javascript: etc.). */
function cleanUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : '';
}

export async function GET() {
  try {
    const albums = getAllAlbums();
    const formatted = albums.map((a) => ({
      ...a,
      genres: JSON.parse(a.genres || '[]'),
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json({ error: 'Error fetching albums' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { title, imageUrl, genres, releaseDate, spotifyUrl, bandcampUrl } = body;

    if (!title || !imageUrl || !releaseDate) {
      return NextResponse.json(
        { error: 'Title, image URL and release date are required.' },
        { status: 400 }
      );
    }

    if (!isIsoDate(releaseDate)) {
      return NextResponse.json({ error: 'Release date must use the YYYY-MM-DD format.' }, { status: 400 });
    }

    let genreArray: string[] = [];
    if (Array.isArray(genres)) {
      genreArray = genres;
    } else if (typeof genres === 'string') {
      genreArray = genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
    }

    if (genreArray.length === 0) {
      genreArray = ['Music'];
    }

    const inserted = insertAlbum({
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      genres: genreArray,
      releaseDate,
      spotifyUrl: cleanUrl(spotifyUrl),
      bandcampUrl: cleanUrl(bandcampUrl),
    });

    return NextResponse.json(
      {
        message: 'Album added successfully',
        album: {
          ...inserted,
          genres: JSON.parse(inserted.genres || '[]'),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving album:', error);
    return NextResponse.json({ error: 'Error saving to the database' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { id, title, imageUrl, genres, releaseDate, spotifyUrl, bandcampUrl } = body;

    if (!id || !title || !imageUrl || !releaseDate) {
      return NextResponse.json(
        { error: 'ID, title, image URL and release date are required.' },
        { status: 400 }
      );
    }

    if (!isIsoDate(releaseDate)) {
      return NextResponse.json({ error: 'Release date must use the YYYY-MM-DD format.' }, { status: 400 });
    }

    let genreArray: string[] = [];
    if (Array.isArray(genres)) {
      genreArray = genres;
    } else if (typeof genres === 'string') {
      genreArray = genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
    }

    if (genreArray.length === 0) {
      genreArray = ['Music'];
    }

    const updated = updateAlbum(Number(id), {
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      genres: genreArray,
      releaseDate,
      spotifyUrl: cleanUrl(spotifyUrl),
      bandcampUrl: cleanUrl(bandcampUrl),
    });

    return NextResponse.json({
      message: 'Album updated successfully',
      album: {
        ...updated,
        genres: JSON.parse(updated.genres || '[]'),
      },
    });
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json({ error: 'Error updating the album in the database' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ error: 'Missing album ID' }, { status: 400 });
    }

    deleteAlbum(Number(idParam));
    return NextResponse.json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json({ error: 'Error deleting the album' }, { status: 500 });
  }
}
