'use client';

import { useEffect, useState } from 'react';
import { Award, Clock, ExternalLink, GraduationCap } from 'lucide-react';
import { formatMonth } from '@/app/lib/formatDate';
import SectionHeader from '@/app/components/SectionHeader';

interface Study {
  id: number;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  current: number;
  description: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate: string;
  credentialUrl: string;
}

async function load<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url);
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Could not load ${url}`, err);
    return [];
  }
}

export default function Education() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([load<Study>('/api/education'), load<Certification>('/api/certifications')]).then(([s, c]) => {
      setStudies(s);
      setCerts(c);
      setLoaded(true);
    });
  }, []);

  return (
    <section id="education" className="py-20 px-8 lg:px-14 scroll-mt-4 space-y-16">
      <div>
        <SectionHeader
          label="// learning"
          title="Education"
          section="education"
        />

        {loaded && studies.length === 0 && (
          <p className="font-mono text-xs text-slate-600">No education added yet.</p>
        )}

        <div className="flex flex-col gap-5">
          {studies.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-[#3b82f6] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white text-sm">{s.degree}</p>
                    <p className="text-slate-500 text-sm">{s.institution}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-mono text-slate-600 shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatMonth(s.startDate)} – {s.current ? 'In progress' : formatMonth(s.endDate)}
                </span>
              </div>
              {s.description && (
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line mt-3 sm:pl-8">
                  {s.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certifications — only rendered when there is at least one */}
      {certs.length > 0 && (
        <div>
          <SectionHeader
            level="subsection"
            accent="copper"
            label="// credentials"
            title="Certifications"
            section="certifications"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certs.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-2 p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#c47d3b] transition-colors duration-200"
              >
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-[#c47d3b] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white text-sm">{c.name}</p>
                    <p className="text-slate-500 text-sm">{c.issuer}</p>
                  </div>
                </div>
                <p className="font-mono text-xs text-slate-600 sm:pl-8">
                  Issued {formatMonth(c.issueDate)}
                  {c.expirationDate && ` · Expires ${formatMonth(c.expirationDate)}`}
                </p>
                {c.credentialUrl && (
                  <a
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-white transition-colors sm:pl-8"
                  >
                    <ExternalLink className="w-3 h-3" /> Show credential
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
