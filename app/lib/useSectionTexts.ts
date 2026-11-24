'use client';

import { useEffect, useState } from 'react';
import { SECTION_DEFAULTS } from '@/app/lib/sectionTexts';

type Texts = Record<string, string>;

// One shared request per page load, however many section headers ask for it.
let pending: Promise<Texts> | null = null;

function fetchTexts(): Promise<Texts> {
  pending ??= fetch('/api/sections')
    .then((res) => (res.ok ? res.json() : SECTION_DEFAULTS))
    .catch(() => SECTION_DEFAULTS);
  return pending;
}

/** Returns the subtext for a section, or `null` until it has loaded. */
export function useSectionText(key: string): string | null {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchTexts().then((texts) => alive && setText(texts[key] ?? (SECTION_DEFAULTS as Texts)[key] ?? ''));
    return () => {
      alive = false;
    };
  }, [key]);

  return text;
}
