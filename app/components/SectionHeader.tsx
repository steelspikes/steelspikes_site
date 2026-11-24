'use client';

import type { ReactNode } from 'react';
import { useSectionText } from '@/app/lib/useSectionTexts';
import type { SectionKey } from '@/app/lib/sectionTexts';

interface SectionHeaderProps {
  label: string;
  title: ReactNode;
  /** Which editable subtext to show (managed in Admin → Sections). */
  section: SectionKey;
  /** `section` = page-level heading, `subsection` = smaller heading nested inside a section. */
  level?: 'section' | 'subsection';
  accent?: 'blue' | 'copper';
}

/** Shared heading for every public section so they all follow the same label → title → subtext flow. */
export default function SectionHeader({ label, title, section, level = 'section', accent = 'blue' }: SectionHeaderProps) {
  const sub = useSectionText(section);
  const color = accent === 'copper' ? 'text-[#c47d3b]' : 'text-[#3b82f6]';
  const bar = accent === 'copper' ? 'bg-[#c47d3b]' : 'bg-[#2563eb]';
  const Heading = level === 'section' ? 'h2' : 'h3';

  return (
    <div className={level === 'section' ? 'mb-10' : 'mb-8'}>
      <p className={`font-mono text-xs ${color} tracking-widest uppercase mb-2`}>{label}</p>
      <Heading
        className={`${level === 'section' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold text-white mb-1`}
      >
        {title}
      </Heading>
      {/* Hidden (but space is kept) until loaded; omitted entirely when the subtext is empty. */}
      {sub !== '' && (
        <p className={`text-slate-500 text-sm max-w-lg mt-2 min-h-5 transition-opacity ${sub === null ? 'opacity-0' : ''}`}>
          {sub ?? ' '}
        </p>
      )}
      <div className={`w-8 h-[2px] ${bar} mt-4`} />
    </div>
  );
}
