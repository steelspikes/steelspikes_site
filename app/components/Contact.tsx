'use client';

import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
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
import SectionHeader from '@/app/components/SectionHeader';

export default function Contact() {
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

  const email = (socialsMap.email || '').trim();

  const socials = [
    ...(email
      ? [{ href: `mailto:${email}`, label: 'Email', icon: <Mail className="w-4 h-4" />, external: false }]
      : []),
    { href: socialsMap.linkedin  || defaultSocials.linkedin,  label: 'LinkedIn',  icon: <LinkedInIcon  className="w-4 h-4" />, external: true },
    { href: socialsMap.github    || defaultSocials.github,    label: 'GitHub',    icon: <GitHubIcon    className="w-4 h-4" />, external: true },
    { href: socialsMap.facebook  || defaultSocials.facebook,  label: 'Facebook',  icon: <FacebookIcon  className="w-4 h-4" />, external: true },
    { href: socialsMap.instagram || defaultSocials.instagram, label: 'Instagram', icon: <InstagramIcon className="w-4 h-4" />, external: true },
    { href: socialsMap.youtube   || defaultSocials.youtube,   label: 'YouTube',   icon: <YouTubeIcon   className="w-4 h-4" />, external: true },
    { href: socialsMap.bandcamp  || defaultSocials.bandcamp,  label: 'Bandcamp',  icon: <BandcampIcon  className="w-4 h-4" />, external: true },
    { href: socialsMap.spotify   || defaultSocials.spotify,   label: 'Spotify',   icon: <SpotifyIcon   className="w-4 h-4" />, external: true },
  ];

  return (
    <section id="contacto" className="py-20 px-8 lg:px-14 scroll-mt-4">
      <div className="h-px bg-[#1a2f50] mb-16" />
      <div className="max-w-lg">
        <SectionHeader
          label="// get_in_touch"
          title={
            <>
              Let&apos;s talk code, <span className="text-[#c47d3b]">or music.</span>
            </>
          }
          section="contact"
        />

        {/* Contact channels */}
        <div className="flex items-center gap-2 flex-wrap">
          {socials.map((s) => (
            <a key={s.label} href={s.href} {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
