'use client';

import { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { formatMonth } from '@/app/lib/formatDate';
import SectionHeader from '@/app/components/SectionHeader';
import Reveal from '@/app/components/Reveal';

interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  current: number;
  modality: string;
  description: string;
}

export default function Experience() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/experience')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setItems(data))
      .catch((err) => console.error('Could not load experience', err))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section id="experience" className="py-24 px-8 lg:px-14 scroll-mt-4">
      <SectionHeader
        label="// career"
        title="My Experience"
        section="experience"
      />

      {loaded && items.length === 0 && (
        <p className="font-mono text-xs text-muted">No experience added yet.</p>
      )}

      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line hidden sm:block" />
        <div className="flex flex-col gap-5">
          {items.map((exp, i) => (
            <Reveal key={exp.id} index={i} className="sm:pl-10 relative">
              <span
                className={`hidden sm:block absolute left-0 top-6 w-[15px] h-[15px] rounded-full border-2 ${
                  exp.current ? 'border-accent-strong bg-bg' : 'border-line-strong bg-bg'
                }`}
              >
                {exp.current ? (
                  <span className="pulse absolute inset-[3px] rounded-full bg-accent" />
                ) : null}
              </span>
              <div className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-ink text-lg tracking-tight">{exp.role}</p>
                      {exp.current ? (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent-strong/50 rounded px-1.5 py-px">
                          now
                        </span>
                      ) : null}
                    </div>
                    <p className="text-body text-sm">{exp.company}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1 text-xs font-mono text-muted shrink-0">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatMonth(exp.startDate)} – {exp.current ? 'Present' : formatMonth(exp.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {exp.modality}
                    </span>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-body text-[15px] leading-relaxed whitespace-pre-line">{exp.description}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
