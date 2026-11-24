'use client';

import { useEffect, useState } from 'react';
import { skillIcons, DEFAULT_SKILL_ICON } from '@/app/lib/skillIcons';
import SectionHeader from '@/app/components/SectionHeader';

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
    <section id="skills" className="py-20 px-8 lg:px-14 scroll-mt-4">
      <SectionHeader
        label="// specialties"
        title="Skills & Stack"
        section="skills"
      />

      {loaded && groups.length === 0 && <p className="font-mono text-xs text-slate-600">No skills added yet.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {groups.map((group) => {
          const Icon = skillIcons[group.icon] ?? skillIcons[DEFAULT_SKILL_ICON];
          return (
            <div
              key={group.id}
              className="flex flex-col gap-4 p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-md bg-[#060f1e] border border-[#2563eb] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{group.title}</h3>
                {group.description && (
                  <p className="text-slate-500 text-xs leading-relaxed">{group.description}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-1.5 py-0.5 rounded bg-[#060f1e] text-slate-500 text-[11px] font-mono border border-[#1a2f50]"
                  >
                    {skill}
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
