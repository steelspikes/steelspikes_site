'use client';

import type { ReactNode } from 'react';
import { useSectionText } from '@/app/lib/useSectionTexts';
import type { SectionKey } from '@/app/lib/sectionTexts';
import Reveal from '@/app/components/Reveal';
import PixelLoop from '@/app/components/PixelLoop';

interface SectionHeaderProps {
  label: string;
  title: ReactNode;
  /** Which editable subtext to show (managed in Admin → Sections). */
  section: SectionKey;
  /** `section` = page-level heading, `subsection` = smaller heading nested inside a section. */
  level?: 'section' | 'subsection';
  accent?: 'blue' | 'alt';
}

/** Order of the top-level sections — gives each one its "01, 02…" index. */
const SECTION_INDEX: Partial<Record<SectionKey, number>> = {
  skills: 1,
  experience: 2,
  education: 3,
  projects: 4,
  music: 5,
  contact: 6,
};

/** Pixel-art animal shown next to each top-level section title (4 frames, 24 px tall). */
const SECTION_ART: Partial<Record<SectionKey, { name: string; width: number }>> = {
  skills:     { name: 'skills',     width: 34 }, // turtle, cat and bird stacked up
  experience: { name: 'experience', width: 30 }, // wise owl with a coffee
  education:  { name: 'education',  width: 28 }, // penguin graduate
  projects:   { name: 'projects',   width: 40 }, // beaver builder gnawing a log
  music:      { name: 'music',      width: 40 }, // frog DJ
  contact:    { name: 'contact',    width: 36 }, // carrier pigeon with a letter
};
const ART_FRAMES = Object.fromEntries(
  Object.values(SECTION_ART).map((a) => [a!.name, [1, 2, 3, 4].map((n) => `/sections/${a!.name}${n}.png`)]),
);

/** Shared heading for every public section so they all follow the same label → title → subtext flow. */
export default function SectionHeader({ label, title, section, level = 'section', accent = 'blue' }: SectionHeaderProps) {
  const sub = useSectionText(section);
  const color = accent === 'alt' ? 'text-alt' : 'text-accent';
  const Heading = level === 'section' ? 'h2' : 'h3';
  const index = level === 'section' ? SECTION_INDEX[section] : undefined;
  const art = level === 'section' ? SECTION_ART[section] : undefined;

  return (
    <Reveal className={level === 'section' ? 'mb-12' : 'mb-8'}>
      <div className="flex items-center gap-3 mb-5 font-mono text-xs tracking-widest uppercase">
        {index !== undefined && <span className="text-faint">{String(index).padStart(2, '0')}</span>}
        <span className={color}>{label}</span>
        <span className="flex-1 h-px bg-line" />
      </div>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        {art && <PixelLoop frames={ART_FRAMES[art.name]} width={art.width} height={24} fps={4} />}
        <Heading
          className={`font-display ${
            level === 'section' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-[1.65rem]'
          } font-semibold text-ink tracking-tight leading-tight`}
        >
          {title}
        </Heading>
      </div>
      {/* Hidden (but space is kept) until loaded; omitted entirely when the subtext is empty. */}
      {sub !== '' && (
        <p className={`text-muted text-[15px] max-w-lg mt-3 min-h-5 transition-opacity ${sub === null ? 'opacity-0' : ''}`}>
          {sub ?? ' '}
        </p>
      )}
    </Reveal>
  );
}
