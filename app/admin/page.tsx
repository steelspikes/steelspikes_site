import Link from 'next/link';
import { Briefcase, Disc, FolderGit2, GraduationCap, Layers, Sliders, TextCursorInput } from 'lucide-react';

const options = [
  { href: '/admin/general', label: 'General', desc: 'Profile, social links and CV', icon: Sliders },
  { href: '/admin/sections', label: 'Sections', desc: 'Subtext under each section title', icon: TextCursorInput },
  { href: '/admin/skills', label: 'Skills', desc: 'Skill groups and stack', icon: Layers },
  { href: '/admin/experience', label: 'Experience', desc: 'Manage your work history', icon: Briefcase },
  { href: '/admin/education', label: 'Education', desc: 'University studies and certifications', icon: GraduationCap },
  { href: '/admin/projects', label: 'Projects', desc: 'Add, edit and order your projects', icon: FolderGit2 },
  { href: '/admin/disks', label: 'Albums', desc: 'Add, edit and delete albums', icon: Disc },
];

export default function AdminDashboard() {
  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-5xl space-y-8">
      <header className="border-b border-[#1a2f50] pb-6">
        <p className="font-mono text-xs text-[#3b82f6] tracking-widest uppercase mb-1">{'// admin'}</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="font-mono text-xs text-slate-500 mt-0.5">Pick a section from the sidebar or jump in below.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {options.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-2 p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] transition-colors"
          >
            <Icon className="w-5 h-5 text-[#3b82f6]" />
            <p className="font-semibold text-white text-sm">{label}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
