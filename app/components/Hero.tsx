'use client';

import { useState, useEffect } from 'react';
import { Code2, Music2, ArrowDownRight } from 'lucide-react';
import { personalInfo as defaultInfo } from '@/app/data/portfolioData';
import PixelLoop from '@/app/components/PixelLoop';

// Pixel-art sprites sitting on top of the role pills.
const SERVER_FIRE = Array.from({ length: 16 }, (_, i) => `/serverfire/serverfire${i + 1}.png`);
const ABBEY_ROAD  = [1, 2, 3, 4].map((n) => `/abbey/abbey${n}.png`);

const GREETING = '> hello_world.exe';

/** Types `text` out one character at a time; returns what has been typed so far. */
function useTypewriter(text: string, speed = 55, startDelay = 300) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i = reduce ? text.length : i + 1;
      setCount(i);
      if (i < text.length) timer = setTimeout(tick, speed);
    };
    timer = setTimeout(tick, reduce ? 0 : startDelay);
    return () => clearTimeout(timer);
  }, [text, speed, startDelay]);

  return text.slice(0, count);
}

export default function Hero() {
  const [profile, setProfile] = useState(defaultInfo);
  const typed = useTypewriter(GREETING);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || defaultInfo.name,
            role: data.role || defaultInfo.role,
            heroSubtitle: data.heroSubtitle || defaultInfo.heroSubtitle,
            cvUrl: data.cvUrl || defaultInfo.cvUrl,
            musicIntro: data.musicIntro || defaultInfo.musicIntro,
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  const roleParts = profile.role.split(' & ');

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col justify-center px-8 lg:px-14 pt-20 md:pt-0 overflow-hidden"
    >
      {/* Graph-paper dot grid, fading out under the copy */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--line-strong) 1px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-3xl">
        {/* Greeting */}
        <p className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-8 h-4" aria-label={GREETING}>
          <span aria-hidden="true">{typed}</span>
          <span className="caret" aria-hidden="true" />
        </p>

        {/* Main heading */}
        <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-semibold text-ink leading-[1.02] tracking-[-0.03em] mb-7">
          <span className="block text-muted font-normal">Hi, I&apos;m</span>
          <span className="block">
            {profile.name}
            <span className="text-alt">.</span>
          </span>
        </h1>

        {/* Role pills */}
        <div className="flex flex-wrap items-end gap-2 mb-8">
          <div className="flex flex-col items-start">
            {/* Sad dog, burning server and a conveyor belt of ERROR signs, on top of the engineer pill */}
            <PixelLoop frames={SERVER_FIRE} width={96} height={24} fps={10} />
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent-strong text-white text-xs font-mono font-semibold">
              <Code2 className="w-3.5 h-3.5" /> {roleParts[0] || profile.role}
            </span>
          </div>
          {roleParts[1] && (
            <div className="flex flex-col items-start">
              {/* Abbey Road walkers sitting right on top of the music pill */}
              <PixelLoop frames={ABBEY_ROAD} width={68} height={24} />
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface border border-alt text-alt text-xs font-mono font-semibold">
                <Music2 className="w-3.5 h-3.5" /> {roleParts[1]}
              </span>
            </div>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-body text-lg sm:text-xl leading-relaxed mb-11 max-w-xl">
          {profile.heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <a href="#proyectos" className="btn btn-primary px-5 py-2.5 text-sm">
            View projects
            <ArrowDownRight className="w-4 h-4" />
          </a>
          <a href="#musica" className="btn btn-ghost px-5 py-2.5 text-sm">
            Explore music
            <span className="eq eq-paused" aria-hidden="true">
              <span /><span /><span />
            </span>
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <a
        href="#skills"
        className="hidden md:flex absolute bottom-10 left-8 lg:left-14 items-center gap-3 font-mono text-[11px] tracking-widest uppercase text-faint hover:text-muted transition-colors"
      >
        <span className="w-8 h-px bg-current" />
        scroll
      </a>
    </section>
  );
}
