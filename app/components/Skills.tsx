import { Server, Link2, Layers, Terminal, type LucideIcon } from 'lucide-react';
import { skillsData } from '@/app/data/portfolioData';

const iconMap: Record<string, LucideIcon> = { Server, Link2, Layers, Terminal };

export default function Skills() {
  return (
    <section id="skills" className="py-20 px-8 lg:px-14 scroll-mt-4">
      <SH
        label="// especialidades"
        title="Habilidades & Stack"
        sub="De la infraestructura al protocolo — sistemas que resisten escala real."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {skillsData.map((skill) => {
          const Icon = iconMap[skill.icon] ?? Server;
          return (
            <div
              key={skill.id}
              className="flex flex-col gap-4 p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-md bg-[#060f1e] border border-[#2563eb] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{skill.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{skill.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {skill.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded bg-[#060f1e] text-slate-500 text-[11px] font-mono border border-[#1a2f50]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
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

