import { GitFork, ExternalLink, Clock } from 'lucide-react';
import { experienceData, projectsData } from '@/app/data/portfolioData';

export default function Projects() {
  return (
    <section id="proyectos" className="py-20 px-8 lg:px-14 scroll-mt-4 space-y-16">
      {/* Experience */}
      <div>
        <SH label="// trayectoria" title="Experiencia" />
        <div className="relative">
          <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#1a2f50] hidden sm:block" />
          <div className="flex flex-col gap-5">
            {experienceData.map((exp) => (
              <div key={exp.id} className="sm:pl-8 relative flex items-start">
                <div className="hidden sm:block absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-[#060f1e] border-2 border-[#2563eb]" />
                <div className="flex-1 p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div>
                      <span className="font-semibold text-white text-sm">{exp.role}</span>
                      <span className="text-slate-600 text-sm"> — {exp.company}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono text-slate-600 shrink-0">
                      <Clock className="w-3 h-3" />{exp.period}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{exp.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div>
        <SH label="// build log" title="Proyectos" sub="Problemas reales, soluciones construidas desde cero." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projectsData.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col gap-4 p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] transition-colors duration-200"
            >
              <h3 className="font-semibold text-white text-sm">{proj.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">{proj.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {proj.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded bg-[#060f1e] text-slate-500 text-[11px] font-mono border border-[#1a2f50]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-[#1a2f50]">
                <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#3b82f6] transition-colors font-mono">
                  <GitFork className="w-3.5 h-3.5" /> GitHub
                </a>
                {proj.liveUrl && (
                  <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#22c55e] transition-colors font-mono">
                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SH({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="mb-10">
      <p className="font-mono text-xs text-[#3b82f6] tracking-widest uppercase mb-2">{label}</p>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{title}</h2>
      {sub && <p className="text-slate-500 text-sm max-w-lg mt-2">{sub}</p>}
      <div className="w-8 h-[2px] bg-[#2563eb] mt-4" />
    </div>
  );
}

