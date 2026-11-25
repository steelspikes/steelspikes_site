'use client';

import { useEffect, useState } from 'react';
import { skillIcons, DEFAULT_SKILL_ICON } from '@/app/lib/skillIcons';
import SectionHeader from '@/app/components/SectionHeader';
import Reveal from '@/app/components/Reveal';

interface SkillGroup {
  id: number;
  icon: string;
  title: string;
  description: string;
  skills: string[];
}

export default function Skills() {
  const [groups, setGroups] = useState<SkillGroup[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/skills')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setGroups(data))
      .catch((err) => console.error('Could not load skills', err))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section id="skills" className="py-24 px-8 lg:px-14 scroll-mt-4">
      <SectionHeader
        label="// specialties"
        title="Skills & Stack"
        section="skills"
      />

      {loaded && groups.length === 0 && <p className="font-mono text-xs text-muted">No skills added yet.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {groups.map((group, i) => {
          const Icon = skillIcons[group.icon] ?? skillIcons[DEFAULT_SKILL_ICON];
          return (
            <Reveal key={group.id} index={i} className="flex">
              <div className="card group flex-1 flex flex-col gap-5 p-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-md bg-bg border border-line-strong group-hover:border-accent-strong flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-mono text-[10px] text-faint">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink text-lg tracking-tight mb-1.5">{group.title}</h3>
                  {group.description && <p className="text-muted text-sm leading-relaxed">{group.description}</p>}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {group.skills.map((skill) => (
                    <span key={skill} className="chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
