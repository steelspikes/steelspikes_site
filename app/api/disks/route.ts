import { NextResponse } from 'next/server';
import { getAllAlbums, insertAlbum, deleteAlbum, updateAlbum } from '@/app/lib/db';

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
    return NextResponse.json({ error: 'Error al obtener discos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, imageUrl, genres, releaseDate, platformUrl } = body;

    if (!title || !imageUrl || !releaseDate) {
      return NextResponse.json(
        { error: 'Título, URL de imagen y Fecha son campos obligatorios.' },
        { status: 400 }
      );
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
      genreArray = ['Música'];
    }

    const inserted = insertAlbum({
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      genres: genreArray,
      releaseDate: releaseDate.trim(),
      platformUrl: platformUrl ? platformUrl.trim() : '',
    });

    return NextResponse.json(
      {
        message: 'Disco agregado con éxito',
        album: {
          ...inserted,
          genres: JSON.parse(inserted.genres || '[]'),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving album:', error);
    return NextResponse.json({ error: 'Error al guardar en la base de datos' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, imageUrl, genres, releaseDate, platformUrl } = body;

    if (!id || !title || !imageUrl || !releaseDate) {
      return NextResponse.json(
        { error: 'ID, Título, URL de imagen y Fecha son campos obligatorios.' },
        { status: 400 }
      );
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
      genreArray = ['Música'];
    }

    const updated = updateAlbum(Number(id), {
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      genres: genreArray,
      releaseDate: releaseDate.trim(),
      platformUrl: platformUrl ? platformUrl.trim() : '',
    });

    return NextResponse.json({
      message: 'Disco actualizado con éxito',
      album: {
        ...updated,
        genres: JSON.parse(updated.genres || '[]'),
      },
    });
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json({ error: 'Error al actualizar el disco en la base de datos' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ error: 'Falta el ID del disco' }, { status: 400 });
    }

    deleteAlbum(Number(idParam));
    return NextResponse.json({ message: 'Disco eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json({ error: 'Error al eliminar el disco' }, { status: 500 });
  }
}
