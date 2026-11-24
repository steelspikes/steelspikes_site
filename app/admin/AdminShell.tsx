'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Disc,
  FolderGit2,
  GraduationCap,
  KeyRound,
  Layers,
  LayoutDashboard,
  Menu,
  Sliders,
  TextCursorInput,
  X,
  type LucideIcon,
} from 'lucide-react';
import LogoutButton from '@/app/admin/LogoutButton';

const sections: { label: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  {
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/general', label: 'General', icon: Sliders },
      { href: '/admin/sections', label: 'Sections', icon: TextCursorInput },
      { href: '/admin/skills', label: 'Skills', icon: Layers },
      { href: '/admin/experience', label: 'Experience', icon: Briefcase },
      { href: '/admin/education', label: 'Education', icon: GraduationCap },
      { href: '/admin/projects', label: 'Projects', icon: FolderGit2 },
      { href: '/admin/disks', label: 'Albums', icon: Disc },
    ],
  },
  {
    label: 'Account',
    items: [{ href: '/admin/settings', label: 'Settings', icon: KeyRound }],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-[#060f1e] text-slate-100">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#060f1e] border-b border-[#1a2f50] flex items-center justify-between px-5">
        <span className="font-mono text-sm font-bold text-[#3b82f6]">
          admin<span className="text-white">.panel</span>
        </span>
        <button
          onClick={() => setOpen(!open)}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 h-full w-[240px] z-50 overflow-y-auto',
          'bg-[#060f1e] border-r border-[#1a2f50]',
          'flex flex-col px-5 py-8 gap-6',
          'transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'pt-20 md:pt-8',
        ].join(' ')}
      >
        <div>
          <p className="font-mono text-sm font-bold text-[#3b82f6]">
            admin<span className="text-white">.panel</span>
          </p>
          <p className="font-mono text-[10px] text-slate-600 mt-0.5">Manage your portfolio</p>
        </div>

        <nav className="flex flex-col gap-5">
          {sections.map((section) => (
            <div key={section.label} className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest px-2 mb-1">
                {section.label}
              </span>
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-mono transition-colors ${
                      active
                        ? 'bg-[#2563eb]/15 text-white border border-[#2563eb]/40'
                        : 'text-slate-400 hover:text-white hover:bg-[#0b1628] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#3b82f6]' : ''}`} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex flex-col gap-3 pt-4 border-t border-[#1a2f50]">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Content */}
      <main className="md:ml-[240px] min-h-screen pt-14 md:pt-0">{children}</main>
    </div>
  );
}
