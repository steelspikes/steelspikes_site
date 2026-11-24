'use client';

import { useState, useEffect } from 'react';
import {
  Disc,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { sortByNewest } from '@/app/lib/albumDate';
import { SpotifyIcon, BandcampIcon } from '@/app/components/SocialIcons';
import { formatReleaseDate } from '@/app/lib/formatDate';

interface Album {
  id: number;
  title: string;
  imageUrl: string;
  genres: string[];
  releaseDate: string;
  spotifyUrl: string;
  bandcampUrl: string;
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
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [bandcampUrl, setBandcampUrl] = useState('');

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/disks');
      if (res.ok) {
        const data = await res.json();
        setAlbums(sortByNewest<Album>(data));
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
    setSpotifyUrl(album.spotifyUrl || '');
    setBandcampUrl(album.bandcampUrl || '');
    setMessage(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setImageUrl('');
    setGenres('');
    setReleaseDate('');
    setSpotifyUrl('');
    setBandcampUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!title || !imageUrl || !releaseDate) {
      setMessage({ type: 'error', text: 'Please fill in the required fields (*).' });
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
        spotifyUrl,
        bandcampUrl,
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
            ? 'Album updated successfully!'
            : 'Album added successfully!',
        });
        handleCancelEdit();
        fetchAlbums();
      } else {
        setMessage({ type: 'error', text: data.error || 'An error occurred while processing the album.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this album?')) return;

    try {
      const res = await fetch(`/api/disks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Album deleted successfully.' });
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchAlbums();
      } else {
        setMessage({ type: 'error', text: 'Could not delete the album.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    }
  };

  return (
    <div className="text-slate-100 p-4 sm:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a2f50] pb-6">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Disc className="w-5 h-5 text-[#c47d3b]" />
                <h1 className="text-2xl font-bold text-white tracking-tight">Albums Admin</h1>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-0.5">
                Persistent storage in SQLite (better-sqlite3)
              </p>
            </div>
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
                      <Pencil className="w-5 h-5 text-[#c47d3b]" /> Edit Album #{editingId}
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-[#2563eb]" /> Add New Album
                    </>
                  )}
                </h2>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white transition-colors bg-[#060f1e] px-2 py-1 rounded border border-[#1a2f50]"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Album Title */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Album / EP Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Latency or Zero Confirmation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Image URL (Album Art) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/cover.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                  {imageUrl && (
                    <div className="mt-2 flex items-center gap-3 p-2 rounded bg-[#060f1e] border border-[#1a2f50]">
                      <div className="w-12 h-12 relative rounded overflow-hidden shrink-0 bg-slate-800 border border-[#1a2f50]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Image preview</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Genres (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Synthwave, Ambient, Techno"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Release Date / Year */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Release Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Platform links */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <SpotifyIcon className="w-3.5 h-3.5" /> Spotify
                  </label>
                  <input
                    type="url"
                    placeholder="https://open.spotify.com/album/..."
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <BandcampIcon className="w-3.5 h-3.5" /> Bandcamp
                  </label>
                  <input
                    type="url"
                    placeholder="https://artist.bandcamp.com/album/..."
                    value={bandcampUrl}
                    onChange={(e) => setBandcampUrl(e.target.value)}
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
                        {editingId ? 'Updating...' : 'Saving...'}
                      </>
                    ) : editingId ? (
                      <>
                        <Pencil className="w-4 h-4" /> Update Album
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Save Album
                      </>
                    )}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full py-2 px-4 rounded-md bg-[#060f1e] hover:bg-[#1a2f50] text-slate-400 hover:text-white font-mono text-xs transition-colors border border-[#1a2f50]"
                    >
                      Cancel Edit
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
                  <Disc className="w-5 h-5 text-[#c47d3b]" /> Albums ({albums.length})
                </h2>
                <button
                  onClick={fetchAlbums}
                  className="p-1.5 rounded bg-[#060f1e] border border-[#1a2f50] hover:border-[#2563eb] text-slate-400 hover:text-white transition-colors"
                  title="Reload albums"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading && albums.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  Loading albums...
                </div>
              ) : albums.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  No albums yet. Add one with the form!
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
                          <p className="font-mono text-xs text-slate-500">{formatReleaseDate(album.releaseDate)}</p>
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
                        {album.spotifyUrl || album.bandcampUrl ? (
                          <div className="flex items-center gap-2">
                            {album.spotifyUrl && (
                              <a href={album.spotifyUrl} target="_blank" rel="noopener noreferrer" title="Spotify" className="text-slate-500 hover:text-white">
                                <SpotifyIcon className="w-4 h-4" />
                              </a>
                            )}
                            {album.bandcampUrl && (
                              <a href={album.bandcampUrl} target="_blank" rel="noopener noreferrer" title="Bandcamp" className="text-slate-500 hover:text-white">
                                <BandcampIcon className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 font-mono">No links</span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(album)}
                            className="flex items-center gap-1 text-xs text-[#3b82f6] hover:text-sky-300 font-mono transition-colors p-1"
                            title="Edit album"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Editar
                          </button>

                          <button
                            onClick={() => handleDelete(album.id)}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-mono transition-colors p-1"
                            title="Delete album"
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
