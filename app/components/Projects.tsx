'use client';

import { useEffect, useState } from 'react';
import { GitFork, ExternalLink } from 'lucide-react';
import SectionHeader from '@/app/components/SectionHeader';

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setProjects(data))
      .catch((err) => console.error('Could not load projects', err))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section id="proyectos" className="py-20 px-8 lg:px-14 scroll-mt-4">
      <SectionHeader label="// build log" title="Projects" section="projects" />

      {loaded && projects.length === 0 && <p className="font-mono text-xs text-slate-600">No projects added yet.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="flex flex-col rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] overflow-hidden transition-colors duration-200"
          >
            {proj.imageUrl && (
              <div className="aspect-video w-full bg-[#060f1e] overflow-hidden border-b border-[#1a2f50]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="flex flex-col gap-4 p-5 flex-1">
              <h3 className="font-semibold text-white text-sm">{proj.title}</h3>
              {proj.description && (
                <p className="text-slate-400 text-sm leading-relaxed flex-1 whitespace-pre-line">{proj.description}</p>
              )}
              {proj.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-[#060f1e] text-slate-500 text-[11px] font-mono border border-[#1a2f50]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {(proj.githubUrl || proj.liveUrl) && (
                <div className="flex items-center gap-4 pt-2 border-t border-[#1a2f50]">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#3b82f6] transition-colors font-mono"
                    >
                      <GitFork className="w-3.5 h-3.5" /> GitHub
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#22c55e] transition-colors font-mono"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
