/** Sections whose subtext can be edited from the admin panel (client- and server-safe). */
export const SECTION_TEXTS = [
  { key: 'skills', label: 'Skills & Stack', default: 'The tools and technologies I work with, grouped by what they are for.' },
  { key: 'experience', label: 'My Experience', default: 'Where I have worked and what I have built along the way.' },
  { key: 'education', label: 'Education', default: 'My formal studies and the training behind my work.' },
  { key: 'certifications', label: 'Certifications', default: 'Professional certifications and courses I have completed.' },
  { key: 'projects', label: 'Projects', default: 'Things I have built, from side experiments to real-world tools.' },
  { key: 'music', label: 'Music & Discography', default: 'Electronic music I write and produce, and where to listen to it.' },
  { key: 'contact', label: 'Contact', default: 'Got an idea, a question or a collaboration in mind? Reach out through any of these.' },
] as const;

export type SectionKey = (typeof SECTION_TEXTS)[number]['key'];

export const SECTION_KEYS: string[] = SECTION_TEXTS.map((s) => s.key);

export const SECTION_DEFAULTS = Object.fromEntries(SECTION_TEXTS.map((s) => [s.key, s.default])) as Record<
  SectionKey,
  string
>;

export const SECTION_TEXT_MAX = 300;
