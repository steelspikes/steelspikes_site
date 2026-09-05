'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Mail } from 'lucide-react';
import { socialLinks as defaultSocials, personalInfo as defaultInfo } from '@/app/data/portfolioData';
import {
  LinkedInIcon,
  GitHubIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  BandcampIcon,
  SpotifyIcon,
} from '@/app/components/SocialIcons';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [socialsMap, setSocialsMap] = useState(defaultSocials);
  const [name, setName] = useState(defaultInfo.name);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.name) setName(data.name);
          if (data.socialLinks) setSocialsMap(data.socialLinks);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(socialsMap.email || 'tu@correo.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    { href: socialsMap.linkedin  || defaultSocials.linkedin,  label: 'LinkedIn',  icon: <LinkedInIcon  className="w-4 h-4" /> },
    { href: socialsMap.github    || defaultSocials.github,    label: 'GitHub',    icon: <GitHubIcon    className="w-4 h-4" /> },
    { href: socialsMap.facebook  || defaultSocials.facebook,  label: 'Facebook',  icon: <FacebookIcon  className="w-4 h-4" /> },
    { href: socialsMap.instagram || defaultSocials.instagram, label: 'Instagram', icon: <InstagramIcon className="w-4 h-4" /> },
    { href: socialsMap.youtube   || defaultSocials.youtube,   label: 'YouTube',   icon: <YouTubeIcon   className="w-4 h-4" /> },
    { href: socialsMap.bandcamp  || defaultSocials.bandcamp,  label: 'Bandcamp',  icon: <BandcampIcon  className="w-4 h-4" /> },
    { href: socialsMap.spotify   || defaultSocials.spotify,   label: 'Spotify',   icon: <SpotifyIcon   className="w-4 h-4" /> },
  ];

  return (
    <section id="contacto" className="py-20 px-8 lg:px-14 scroll-mt-4">
      <div className="h-px bg-[#1a2f50] mb-16" />
      <div className="max-w-lg">
        <p className="font-mono text-xs text-[#3b82f6] tracking-widest uppercase mb-2">// conecta_conmigo</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          Hablemos de código,{' '}
          <span className="text-[#c47d3b]">o de música.</span>
        </h2>
        <p className="text-slate-500 text-sm mt-3 mb-8 leading-relaxed">
          Disponible para proyectos freelance, colaboraciones Web3 o intercambiar
          ideas sobre sistemas y sintetizadores.
        </p>

        {/* Email */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-4 rounded-lg bg-[#0b1628] border border-[#1a2f50] mb-8">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Mail className="w-4 h-4 text-[#3b82f6] shrink-0" />
            <span className="font-mono text-sm text-slate-300 truncate">{socialsMap.email || 'tu@correo.com'}</span>
          </div>
          <button
            onClick={copyEmail}
            className={[
              'flex items-center justify-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-semibold transition-colors duration-150',
              copied ? 'bg-[#22c55e] text-white' : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white',
            ].join(' ')}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
          </button>
        </div>

        {/* Socials */}
        <div className="flex items-center gap-2 flex-wrap">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#1a2f50] bg-[#0b1628] hover:border-[#2563eb] text-slate-400 hover:text-white transition-colors duration-150 text-xs font-mono">
              {s.icon} {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-[#1a2f50] flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-mono text-xs text-slate-700">© {new Date().getFullYear()} {name}.</p>
        <p className="font-mono text-xs text-slate-700">Next.js · Tailwind CSS</p>
      </div>
    </section>
  );
}
