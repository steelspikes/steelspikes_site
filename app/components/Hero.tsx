'use client';

import { useState, useEffect } from 'react';
import { Code2, Music2, ArrowDownRight } from 'lucide-react';
import { personalInfo as defaultInfo } from '@/app/data/portfolioData';

export default function Hero() {
  const [profile, setProfile] = useState(defaultInfo);

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
    <section id="inicio" className="min-h-screen flex flex-col justify-center px-8 lg:px-14 pt-20 md:pt-0">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative max-w-2xl">
        {/* Greeting */}
        <p className="font-mono text-xs text-[#3b82f6] tracking-[0.25em] uppercase mb-6">
          &gt; hello_world.exe
        </p>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5">
          Hi, I'm<br />
          <span className="text-[#3b82f6]">{profile.name}</span>
        </h1>

        {/* Role pills */}
        <div className="flex flex-wrap gap-2 mb-7">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2563eb] text-white text-xs font-mono font-semibold">
            <Code2 className="w-3.5 h-3.5" /> {roleParts[0] || profile.role}
          </span>
          {roleParts[1] && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0b1628] border border-[#c47d3b] text-[#c47d3b] text-xs font-mono font-semibold">
              <Music2 className="w-3.5 h-3.5" /> {roleParts[1]}
            </span>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-10 max-w-xl">
          {profile.heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <a
            href="#proyectos"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-mono font-semibold transition-colors duration-150"
          >
            View projects
            <ArrowDownRight className="w-4 h-4" />
          </a>
          <a
            href="#musica"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#1a2f50] hover:border-[#c47d3b] text-slate-400 hover:text-[#c47d3b] text-sm font-mono font-semibold transition-colors duration-150 bg-[#0b1628]"
          >
            Explore music
            <Music2 className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
