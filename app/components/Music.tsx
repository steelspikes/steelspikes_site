'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Music2 } from 'lucide-react';
import { albumsData, personalInfo } from '@/app/data/portfolioData';

interface AlbumItem {
  id: string | number;
  title: string;
  year: string;
  genres: string[];
  imageUrl?: string;
  gradientFrom?: string;
  gradientTo?: string;
  platformUrl: string;
}

const genreColors: Record<string, string> = {
  Synthwave: '#c47d3b',
  Ambient: '#2563eb',
  Techno: '#ef4444',
  Industrial: '#78716c',
  'Lo-Fi': '#eab308',
  Chillwave: '#06b6d4',
  Progressive: '#a66a38',
};

export default function Music() {
  const [albums, setAlbums] = useState<AlbumItem[]>(albumsData);

  useEffect(() => {
    // Fetch live disks from SQLite database API
    const loadDisksFromDB = async () => {
      try {
        const res = await fetch('/api/disks');
        if (res.ok) {
          const dbAlbums = await res.json();
          if (Array.isArray(dbAlbums) && dbAlbums.length > 0) {
            const mapped: AlbumItem[] = dbAlbums.map((a: {
              id: number;
              title: string;
              releaseDate: string;
              genres: string[];
              imageUrl: string;
              platformUrl: string;
            }) => ({
              id: a.id,
              title: a.title,
              year: a.releaseDate,
              genres: a.genres,
              imageUrl: a.imageUrl,
              platformUrl: a.platformUrl || 'https://open.spotify.com',
            }));
            setAlbums(mapped);
          }
        }
      } catch (err) {
        console.error('Could not load SQLite disks, falling back to static mock data.', err);
      }
    };

    loadDisksFromDB();
  }, []);

  return (
    <section id="musica" className="py-20 px-8 lg:px-14 scroll-mt-4">
      <SH label="// frecuencia alternativa" title="Música & Discografía" />
      <div className="flex items-start gap-2 p-4 rounded-lg bg-[#0b1628] border border-[#1a2f50] mb-8 max-w-xl">
        <Music2 className="w-4 h-4 text-[#c47d3b] mt-0.5 shrink-0" />
        <p className="text-slate-500 text-sm leading-relaxed">{personalInfo.musicIntro}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {albums.map((album) => (
          <div
            key={album.id}
            className="flex flex-col rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#c47d3b] overflow-hidden transition-colors duration-200"
          >
            {/* Album Cover Art */}
            <div
              className="aspect-square w-full relative bg-slate-900 overflow-hidden"
              style={
                album.imageUrl
                  ? undefined
                  : { background: `linear-gradient(145deg, ${album.gradientFrom || '#1e3a5f'}, ${album.gradientTo || '#0e7490'})` }
              }
            >
              {album.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={album.imageUrl} alt={album.title} className="w-full h-full object-cover" />
              ) : (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(0,0,0,0.2) 12px, rgba(0,0,0,0.2) 13px)',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-white/15 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-white/15 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between">
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-white text-sm line-clamp-1">{album.title}</p>
                  <p className="font-mono text-xs text-slate-600">{album.year}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {album.genres.map((genre) => {
                    const c = genreColors[genre] ?? '#3b82f6';
                    return (
                      <span
                        key={genre}
                        className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold"
                        style={{ background: c + '22', color: c, border: `1px solid ${c}55` }}
                      >
                        {genre}
                      </span>
                    );
                  })}
                </div>
              </div>

              <a
                href={album.platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-white transition-colors font-mono pt-2 border-t border-[#1a2f50]"
              >
                <ExternalLink className="w-3 h-3" /> Ver en plataformas
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SH({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="font-mono text-xs text-[#3b82f6] tracking-widest uppercase mb-2">{label}</p>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{title}</h2>
      <div className="w-8 h-[2px] bg-[#2563eb] mt-4" />
    </div>
  );
}
