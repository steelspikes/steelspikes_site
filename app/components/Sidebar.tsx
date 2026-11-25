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
import { useDistractMode, setDistractMode } from '@/app/components/distractMode';
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
  const [active, setActive] = useState('inicio');
  const distract = useDistractMode();

  // Highlight the nav link of whichever section sits in the middle band of the viewport.
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.split('#')[1]);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    // Sections render on the client, so wait a tick before observing.
    const t = setTimeout(() => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }, 0);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, []);

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
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-bg border-b border-line flex items-center justify-between px-5">
        <span className="font-mono text-sm font-bold text-ink">
          {profile.name.split(' ')[0].toLowerCase()}<span className="text-alt">.dev</span>
        </span>
        <button
          onClick={() => setOpen(!open)}
          className="text-muted hover:text-ink transition-colors"
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
          'bg-bg border-r border-line',
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
          <div className="w-20 h-20 rounded-full bg-surface border border-line-strong p-1 shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-surface-2 flex items-center justify-center">
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
              <span className="font-display text-3xl font-semibold text-accent">
                {profile.name.charAt(0)}
              </span>
            )}
            </div>
          </div>
          <div>
            <p className="font-display font-semibold text-ink text-base leading-snug tracking-tight">
              {profile.name}
            </p>
            <p className="font-mono text-[11px] text-accent mt-1">
              {roleParts[0] || profile.role}
            </p>
            {roleParts[1] && (
              <p className="font-mono text-[11px] text-alt">
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
              className="text-muted hover:text-ink hover:-translate-y-0.5 transition duration-150 p-1 rounded"
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5">
          {navLinks.map((link, i) => {
            const isActive = active === link.href.split('#')[1];
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? 'true' : undefined}
                className={`group flex items-center gap-2.5 py-1.5 text-[13px] font-mono transition-colors duration-150 ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                <span className={`text-[10px] transition-colors ${isActive ? 'text-accent' : 'text-faint'}`}>
                  {String(i).padStart(2, '0')}
                </span>
                <span
                  className={`h-px transition-all duration-300 ${
                    isActive ? 'w-5 bg-accent' : 'w-2 bg-line-strong group-hover:w-4 group-hover:bg-muted'
                  }`}
                />
                {link.label}
              </Link>
            );
          })}

        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Distract mode switch (capybara + parrot roaming) */}
        <button
          type="button"
          role="switch"
          aria-checked={distract}
          onClick={() => setDistractMode(!distract)}
          className="flex items-center justify-between gap-3 py-1.5 text-left group"
        >
          <span
            className={`font-display font-extrabold text-lg leading-none tracking-tight -rotate-2 transition-all duration-200 group-hover:rotate-0 group-hover:scale-105 ${
              distract ? 'text-accent' : 'text-body group-hover:text-ink'
            }`}
          >
            Distract mode!
          </span>
          <span
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 transition-colors duration-200 ${
              distract ? 'bg-accent-strong border-accent-strong' : 'bg-surface-2 border-line-strong'
            }`}
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full shadow transition-all duration-200 ${
                distract ? 'left-[22px] bg-ink' : 'left-[2px] bg-muted'
              }`}
            />
          </span>
        </button>

        {/* CV button */}
        <a
          href={profile.cvUrl}
          download
          className="btn btn-primary py-2.5 text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          Download CV
        </a>

        {/* Terminal watermark */}
        <div className="flex items-center gap-1.5 text-faint">
          <Terminal className="w-3 h-3" />
          <span className="font-mono text-[10px]">v2.0.0</span>
        </div>
      </aside>
    </>
  );
}
