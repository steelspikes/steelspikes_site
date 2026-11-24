'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Mail, Menu, X, Terminal } from 'lucide-react';
import { personalInfo as defaultInfo, socialLinks as defaultSocials } from '@/app/data/portfolioData';
import {
  LinkedInIcon,
  GitHubIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  BandcampIcon,
  SpotifyIcon,
} from '@/app/components/SocialIcons';

const navLinks = [
  { label: 'Home',      href: '/#inicio' },
  { label: 'Skills',    href: '/#skills' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Education', href: '/#education' },
  { label: 'Projects',  href: '/#proyectos' },
  { label: 'Music',     href: '/#musica' },
  { label: 'Contact',   href: '/#contacto' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(defaultInfo);
  const [socialsMap, setSocialsMap] = useState(defaultSocials);

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
            avatarUrl: data.avatarUrl || '',
          } as any);
          if (data.socialLinks) {
            setSocialsMap(data.socialLinks);
          }
        }
      } catch (e) {
        console.error('Using default profile', e);
      }
    };
    fetchProfile();
  }, []);

  const email = ((socialsMap as { email?: string }).email || '').trim();

  const socials = [
    ...(email ? [{ icon: <Mail className="w-4 h-4" />, href: `mailto:${email}`, label: 'Email', external: false }] : []),
    { icon: <LinkedInIcon  className="w-4 h-4" />, href: socialsMap.linkedin  || defaultSocials.linkedin,  label: 'LinkedIn' , external: true },
    { icon: <GitHubIcon    className="w-4 h-4" />, href: socialsMap.github    || defaultSocials.github,    label: 'GitHub'   , external: true },
    { icon: <FacebookIcon  className="w-4 h-4" />, href: socialsMap.facebook  || defaultSocials.facebook,  label: 'Facebook' , external: true },
    { icon: <InstagramIcon className="w-4 h-4" />, href: socialsMap.instagram || defaultSocials.instagram, label: 'Instagram', external: true },
    { icon: <YouTubeIcon   className="w-4 h-4" />, href: socialsMap.youtube   || defaultSocials.youtube,   label: 'YouTube'  , external: true },
    { icon: <BandcampIcon  className="w-4 h-4" />, href: socialsMap.bandcamp  || defaultSocials.bandcamp,  label: 'Bandcamp' , external: true },
    { icon: <SpotifyIcon   className="w-4 h-4" />, href: socialsMap.spotify   || defaultSocials.spotify,   label: 'Spotify'  , external: true },
  ];

  const roleParts = profile.role.split(' & ');

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#060f1e] border-b border-[#1a2f50] flex items-center justify-between px-5">
        <span className="font-mono text-sm font-bold text-[#3b82f6]">
          {profile.name.split(' ')[0].toLowerCase()}<span className="text-white">.dev</span>
        </span>
        <button
          onClick={() => setOpen(!open)}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────────── */}
      <aside
        className={[
          // Desktop: always visible fixed
          'fixed top-0 left-0 h-full w-[240px] z-50',
          'bg-[#060f1e] border-r border-[#1a2f50]',
          'flex flex-col px-6 py-8 gap-7',
          // Mobile: slide in/out
          'transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          // Push content on mobile — add top padding
          'pt-20 md:pt-8',
        ].join(' ')}
      >
        {/* Avatar + name */}
        <div className="flex flex-col gap-3">
          <div className="w-20 h-20 rounded-full bg-[#0b1628] border-2 border-[#2563eb] overflow-hidden flex items-center justify-center shrink-0">
            {(profile as any).avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={(profile as any).avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-3xl font-bold text-[#3b82f6]">
                {profile.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-snug">
              {profile.name}
            </p>
            <p className="font-mono text-xs text-[#3b82f6] mt-0.5">
              {roleParts[0] || profile.role}
            </p>
            {roleParts[1] && (
              <p className="font-mono text-xs text-[#c47d3b]">
                & {roleParts[1]}
              </p>
            )}
          </div>
        </div>

        {/* Social icons row */}
        <div className="flex items-center gap-2 flex-wrap">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              aria-label={s.label}
              title={s.label}
              className="text-slate-400 hover:text-white transition-colors duration-150 p-1 hover:bg-[#0b1628] rounded"
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="group flex items-center gap-2 py-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-150 font-mono"
            >
              <span className="w-0 group-hover:w-3 h-px bg-[#2563eb] transition-all duration-200 overflow-hidden" />
              {link.label}
            </Link>
          ))}

        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status badge */}
        <div className="flex items-center gap-2 py-2 px-3 rounded-md bg-[#0b1628] border border-[#1a2f50]">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
          <span className="font-mono text-xs text-slate-400">Available</span>
        </div>

        {/* CV button */}
        <a
          href={profile.cvUrl}
          download
          className="flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-mono font-semibold transition-colors duration-150"
        >
          <Download className="w-3.5 h-3.5" />
          Download CV
        </a>

        {/* Terminal watermark */}
        <div className="flex items-center gap-1.5 opacity-20">
          <Terminal className="w-3 h-3 text-slate-500" />
          <span className="font-mono text-[10px] text-slate-500">v2.0.0</span>
        </div>
      </aside>
    </>
  );
}
