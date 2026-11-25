'use client';

import { useState, useEffect } from 'react';
import { sortByNewest } from '@/app/lib/albumDate';
import { SpotifyIcon, BandcampIcon } from '@/app/components/SocialIcons';
import { formatReleaseDate } from '@/app/lib/formatDate';
import { albumsData } from '@/app/data/portfolioData';
import SectionHeader from '@/app/components/SectionHeader';
import Reveal from '@/app/components/Reveal';
import { Play } from 'lucide-react';

interface AlbumItem {
  id: string | number;
  title: string;
  year: string;
  genres: string[];
  imageUrl?: string;
  gradientFrom?: string;
  gradientTo?: string;
  spotifyUrl?: string;
  bandcampUrl?: string;
}

const genreColors: Record<string, string> = {
  Synthwave: '#a597d4',
  Ambient: '#86a6cf',
  Techno: '#c98a8a',
  Industrial: '#9a948c',
  'Lo-Fi': '#cdb77a',
  Chillwave: '#7fb3b8',
  Progressive: '#b39bc9',
};

export default function Music() {
  const [albums, setAlbums] = useState<AlbumItem[]>(sortByNewest(albumsData));

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
              spotifyUrl: string;
              bandcampUrl: string;
            }) => ({
              id: a.id,
              title: a.title,
              year: a.releaseDate,
              genres: a.genres,
              imageUrl: a.imageUrl,
              spotifyUrl: a.spotifyUrl,
              bandcampUrl: a.bandcampUrl,
            }));
            setAlbums(sortByNewest(mapped));
          }
        }
      } catch (err) {
        console.error('Could not load SQLite disks, falling back to static mock data.', err);
      }
    };

    loadDisksFromDB();
  }, []);

  return (
    <section id="musica" className="py-24 px-8 lg:px-14 scroll-mt-4">
      <SectionHeader
        label="// alternate frequency"
        title="Music & Discography"
        section="music"
        accent="alt"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {albums.map((album, i) => {
          const listenUrl = album.spotifyUrl || album.bandcampUrl;
          return (
            <Reveal key={album.id} index={i} className="flex">
              <div className="card card-alt group flex-1 flex flex-col overflow-hidden">
                {/* Album Cover Art */}
                <div
                  className="aspect-square w-full relative overflow-hidden border-b border-line"
                  style={{ background: album.imageUrl ? 'var(--surface-2)' : album.gradientFrom || '#12233d' }}
                >
                  {album.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={album.imageUrl}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    /* Flat placeholder: a record label drawn with concentric rings */
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border border-white/15 flex items-center justify-center transition-transform duration-[1.5s] ease-out group-hover:rotate-180">
                        <div className="w-14 h-14 rounded-full border border-white/15 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white/30 translate-x-3" />
                        </div>
                      </div>
                    </div>
                  )}

                  {listenUrl && (
                    <a
                      href={listenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Listen to ${album.title}`}
                      className="absolute inset-0 z-10 flex items-end justify-end p-3"
                    >
                      <span className="flex items-center justify-center w-11 h-11 rounded-full bg-alt text-bg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300 shadow-[2px_2px_0_0_var(--alt-shadow)]">
                        <Play className="w-4 h-4 fill-current translate-x-px" />
                      </span>
                    </a>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                  <div className="space-y-2.5">
                    <div>
                      <p className="font-display font-semibold text-ink text-base tracking-tight line-clamp-1">
                        {album.title}
                      </p>
                      <p className="font-mono text-xs text-muted">{formatReleaseDate(album.year)}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {album.genres.map((genre) => {
                        const c = genreColors[genre] ?? '#86a6cf';
                        return (
                          <span
                            key={genre}
                            className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium"
                            style={{ background: c + '1a', color: c, border: `1px solid ${c}44` }}
                          >
                            {genre}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {(album.spotifyUrl || album.bandcampUrl) && (
                    <div className="flex items-center gap-3 pt-3 border-t border-line">
                      {album.spotifyUrl && (
                        <a
                          href={album.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${album.title} on Spotify`}
                          title="Spotify"
                          className="text-muted hover:text-[#1db954] transition-colors"
                        >
                          <SpotifyIcon className="w-5 h-5" />
                        </a>
                      )}
                      {album.bandcampUrl && (
                        <a
                          href={album.bandcampUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${album.title} on Bandcamp`}
                          title="Bandcamp"
                          className="text-muted hover:text-[#1da0c3] transition-colors"
                        >
                          <BandcampIcon className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
