'use client';

import { useState, useEffect } from 'react';
import { Download, Menu, X, Code2 } from 'lucide-react';
import { personalInfo } from '@/app/data/portfolioData';

const navLinks = [
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#proyectos' },
  { label: 'Music', href: '#musica' },
  { label: 'Contact', href: '#contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#060f1e] border-b border-[#1e3560] shadow-lg'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[#0b1628] border border-[#2563eb]">
            <Code2 className="w-4 h-4 text-[#3b82f6]" />
          </span>
          <span className="font-mono text-sm font-bold text-white group-hover:text-[#3b82f6] transition-colors duration-200">
            {personalInfo.name.split(' ')[0].toLowerCase()}
            <span className="text-[#3b82f6]">.dev</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-400 hover:text-white transition-colors duration-150 font-mono tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a
            href={personalInfo.cvUrl}
            download
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#2563eb] text-white text-sm font-mono font-semibold hover:bg-[#1d4ed8] transition-colors duration-150"
          >
            <Download className="w-3.5 h-3.5" />
            Download CV
          </a>
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#060f1e] border-b border-[#1e3560] px-4 pb-6 pt-2">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-slate-400 hover:text-white transition-colors font-mono py-1"
              >
                {link.label}
              </a>
            ))}
            <a
              href={personalInfo.cvUrl}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#2563eb] text-white text-sm font-mono font-semibold hover:bg-[#1d4ed8] w-fit"
            >
              <Download className="w-3.5 h-3.5" />
              Download CV
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
