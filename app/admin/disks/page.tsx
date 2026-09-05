'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Disc,
  Plus,
  Trash2,
  Pencil,
  X,
  ArrowLeft,
  ExternalLink,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface Album {
  id: number;
  title: string;
  imageUrl: string;
  genres: string[];
  releaseDate: string;
  platformUrl: string;
}

export default function AdminDisksPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [genres, setGenres] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [platformUrl, setPlatformUrl] = useState('');

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/disks');
      if (res.ok) {
        const data = await res.json();
        setAlbums(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleEdit = (album: Album) => {
    setEditingId(album.id);
    setTitle(album.title);
    setImageUrl(album.imageUrl);
    setGenres(Array.isArray(album.genres) ? album.genres.join(', ') : '');
    setReleaseDate(album.releaseDate);
    setPlatformUrl(album.platformUrl || '');
    setMessage(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setImageUrl('');
    setGenres('');
    setReleaseDate('');
    setPlatformUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!title || !imageUrl || !releaseDate) {
      setMessage({ type: 'error', text: 'Por favor completa los campos requeridos (*).' });
      return;
    }

    try {
      setSubmitting(true);
      const isEditing = editingId !== null;
      const url = '/api/disks';
      const method = isEditing ? 'PUT' : 'POST';
      const body = {
        ...(isEditing ? { id: editingId } : {}),
        title,
        imageUrl,
        genres,
        releaseDate,
        platformUrl,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: isEditing
            ? '¡Disco actualizado exitosamente en SQLite!'
            : '¡Disco registrado exitosamente en la base de datos!',
        });
        handleCancelEdit();
        fetchAlbums();
      } else {
        setMessage({ type: 'error', text: data.error || 'Ocurrió un error al procesar el disco.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este disco de la base de datos?')) return;

    try {
      const res = await fetch(`/api/disks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Disco eliminado correctamente.' });
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchAlbums();
      } else {
        setMessage({ type: 'error', text: 'No se pudo eliminar el disco.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#060f1e] text-slate-100 p-4 sm:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a2f50] pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] text-slate-400 hover:text-white transition-colors"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Disc className="w-5 h-5 text-[#c47d3b]" />
                <h1 className="text-2xl font-bold text-white tracking-tight">Administrador de Discos</h1>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-0.5">
                Almacenamiento persistente en SQLite DB (better-sqlite3)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/general"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0b1628] border border-[#1a2f50] hover:border-[#3b82f6] text-slate-300 hover:text-white text-xs font-mono transition-colors"
            >
              Configuración General
            </Link>
            <Link
              href="/#musica"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0b1628] border border-[#1a2f50] hover:border-[#c47d3b] text-slate-300 hover:text-[#c47d3b] text-xs font-mono transition-colors"
            >
              Ver en Landing <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Notification Alert */}
        {message && (
          <div
            className={`p-4 rounded-lg flex items-center justify-between gap-3 text-sm font-mono border ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className={`p-6 rounded-xl bg-[#0b1628] border transition-colors space-y-6 ${
                editingId ? 'border-[#c47d3b]' : 'border-[#1a2f50]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#1a2f50] pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {editingId ? (
                    <>
                      <Pencil className="w-5 h-5 text-[#c47d3b]" /> Editar Disco #{editingId}
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-[#2563eb]" /> Agregar Nuevo Disco
                    </>
                  )}
                </h2>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white transition-colors bg-[#060f1e] px-2 py-1 rounded border border-[#1a2f50]"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Album Title */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Nombre del Álbum / EP <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Latency or Zero Confirmation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    URL de la Imagen (Album Art) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://ejemplo.com/portada.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                  {imageUrl && (
                    <div className="mt-2 flex items-center gap-3 p-2 rounded bg-[#060f1e] border border-[#1a2f50]">
                      <div className="w-12 h-12 relative rounded overflow-hidden shrink-0 bg-slate-800 border border-[#1a2f50]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Vista previa de imagen</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Géneros (Separados por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Synthwave, Ambient, Techno"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Release Date / Year */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Año / Fecha de Lanzamiento <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 2024 o Octubre 2024"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Platform URL */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Enlace a Plataforma (Spotify, SoundCloud, etc.)
                  </label>
                  <input
                    type="url"
                    placeholder="https://open.spotify.com/album/..."
                    value={platformUrl}
                    onChange={(e) => setPlatformUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Submit / Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-2.5 px-4 rounded-md text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                      editingId
                        ? 'bg-[#c47d3b] hover:bg-[#b57032]'
                        : 'bg-[#2563eb] hover:bg-[#1d4ed8]'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />{' '}
                        {editingId ? 'Actualizando...' : 'Guardando en SQLite...'}
                      </>
                    ) : editingId ? (
                      <>
                        <Pencil className="w-4 h-4" /> Actualizar Disco
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Guardar Disco
                      </>
                    )}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full py-2 px-4 rounded-md bg-[#060f1e] hover:bg-[#1a2f50] text-slate-400 hover:text-white font-mono text-xs transition-colors border border-[#1a2f50]"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-xl bg-[#0b1628] border border-[#1a2f50] space-y-6">
              <div className="flex items-center justify-between border-b border-[#1a2f50] pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Disc className="w-5 h-5 text-[#c47d3b]" /> Discos en SQLite ({albums.length})
                </h2>
                <button
                  onClick={fetchAlbums}
                  className="p-1.5 rounded bg-[#060f1e] border border-[#1a2f50] hover:border-[#2563eb] text-slate-400 hover:text-white transition-colors"
                  title="Recargar discos"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading && albums.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  Cargando base de datos SQLite...
                </div>
              ) : albums.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  No hay discos registrados aún. ¡Agrega uno con el formulario!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      className={`flex flex-col justify-between p-3 rounded-lg bg-[#060f1e] border transition-colors ${
                        editingId === album.id
                          ? 'border-[#c47d3b] ring-1 ring-[#c47d3b]'
                          : 'border-[#1a2f50] hover:border-[#c47d3b]'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Cover image */}
                        <div className="aspect-square w-full rounded overflow-hidden relative bg-slate-900 border border-[#1a2f50]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={album.imageUrl}
                            alt={album.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold text-white text-sm line-clamp-1">{album.title}</h3>
                          <p className="font-mono text-xs text-slate-500">{album.releaseDate}</p>
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-1">
                          {album.genres.map((g) => (
                            <span
                              key={g}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#c47d3b]/10 text-[#c47d3b] border border-[#c47d3b]/30"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1a2f50]">
                        {album.platformUrl ? (
                          <a
                            href={album.platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-500 hover:text-white font-mono flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Link
                          </a>
                        ) : (
                          <span className="text-xs text-slate-600 font-mono">Sin link</span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(album)}
                            className="flex items-center gap-1 text-xs text-[#3b82f6] hover:text-sky-300 font-mono transition-colors p-1"
                            title="Editar disco"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Editar
                          </button>

                          <button
                            onClick={() => handleDelete(album.id)}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-mono transition-colors p-1"
                            title="Eliminar disco"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
