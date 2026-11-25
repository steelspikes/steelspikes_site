'use client';

import { useEffect, useState } from 'react';
import { GitFork, ExternalLink } from 'lucide-react';
import SectionHeader from '@/app/components/SectionHeader';
import Reveal from '@/app/components/Reveal';

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
    <section id="proyectos" className="py-24 px-8 lg:px-14 scroll-mt-4">
      <SectionHeader label="// build log" title="Projects" section="projects" />

      {loaded && projects.length === 0 && <p className="font-mono text-xs text-muted">No projects added yet.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {projects.map((proj, i) => {
          // The first project gets the full row as a featured piece.
          const featured = i === 0 && projects.length > 1;
          return (
          <Reveal key={proj.id} index={i} className={`flex ${featured ? 'sm:col-span-2' : ''}`}>
          <div
            className={`card group flex-1 flex flex-col overflow-hidden ${
              featured && proj.imageUrl ? 'lg:grid lg:grid-cols-[1.25fr_1fr]' : ''
            }`}
          >
            {proj.imageUrl && (
              <div
                className={`aspect-video w-full bg-bg overflow-hidden border-line ${
                  featured ? 'border-b lg:border-b-0 lg:border-r lg:aspect-auto lg:h-full' : 'border-b'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
            )}
            <div className={`flex flex-col gap-4 flex-1 ${featured ? 'p-6 lg:p-8' : 'p-6'}`}>
              {featured && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-alt">★ featured</span>
              )}
              <h3
                className={`font-display font-semibold text-ink tracking-tight ${featured ? 'text-2xl' : 'text-lg'}`}
              >
                {proj.title}
              </h3>
              {proj.description && (
                <p className="text-body text-[15px] leading-relaxed flex-1 whitespace-pre-line">{proj.description}</p>
              )}
              {proj.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {proj.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {(proj.githubUrl || proj.liveUrl) && (
                <div className="flex items-center gap-5 pt-3 border-t border-line">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors font-mono"
                    >
                      <GitFork className="w-3.5 h-3.5" /> GitHub
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-[#6fbf8f] transition-colors font-mono"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          </Reveal>
          );
        })}
      </div>
    </section>
  );
}
