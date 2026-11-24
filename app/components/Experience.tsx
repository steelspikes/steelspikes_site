'use client';

import { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { formatMonth } from '@/app/lib/formatDate';
import SectionHeader from '@/app/components/SectionHeader';

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
    <section id="experience" className="py-20 px-8 lg:px-14 scroll-mt-4">
      <SectionHeader
        label="// career"
        title="My Experience"
        section="experience"
      />

      {loaded && items.length === 0 && (
        <p className="font-mono text-xs text-slate-600">No experience added yet.</p>
      )}

      <div className="relative">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#1a2f50] hidden sm:block" />
        <div className="flex flex-col gap-5">
          {items.map((exp) => (
            <div key={exp.id} className="sm:pl-8 relative flex items-start">
              <div
                className={`hidden sm:block absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#2563eb] ${
                  exp.current ? 'bg-[#2563eb]' : 'bg-[#060f1e]'
                }`}
              />
              <div className="flex-1 p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] transition-colors duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                  <div>
                    <p className="font-semibold text-white text-sm">{exp.role}</p>
                    <p className="text-slate-500 text-sm">{exp.company}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1 text-xs font-mono text-slate-600 shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatMonth(exp.startDate)} – {exp.current ? 'Present' : formatMonth(exp.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {exp.modality}
                    </span>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
