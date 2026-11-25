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
import Reveal from '@/app/components/Reveal';

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
    <section id="contacto" className="py-24 px-8 lg:px-14 scroll-mt-4">
      <div className="max-w-2xl">
        <SectionHeader
          label="// get_in_touch"
          title={
            <>
              Let&apos;s talk code, <span className="text-alt">or music.</span>
            </>
          }
          section="contact"
        />

        {/* Contact channels */}
        <div className="flex items-center gap-2 flex-wrap">
          {socials.map((s, i) => (
            <Reveal key={s.label} index={i}>
              <a
                href={s.href}
                {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="btn btn-ghost btn-contact px-3.5 py-2 text-xs"
              >
                {s.icon} {s.label}
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-mono text-xs text-faint">© {new Date().getFullYear()} {name}.</p>
        <p className="font-mono text-xs text-faint">Next.js · Tailwind CSS</p>
      </div>
    </section>
  );
}
