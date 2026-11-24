import Sidebar from '@/app/components/Sidebar';
import Hero from '@/app/components/Hero';
import Skills from '@/app/components/Skills';
import Experience from '@/app/components/Experience';
import Education from '@/app/components/Education';
import Projects from '@/app/components/Projects';
import Music from '@/app/components/Music';
import Contact from '@/app/components/Contact';

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* ── Fixed left sidebar ─────────────────────────────────── */}
      <Sidebar />

      {/* ── Scrollable content ─────────────────────────────────── */}
      <main className="flex-1 ml-0 md:ml-[240px] min-h-screen">
        <Hero />
        <div className="px-8 lg:px-14">
          <div className="h-px bg-[#1a2f50]" />
        </div>
        <Skills />
        <div className="px-8 lg:px-14">
          <div className="h-px bg-[#1a2f50]" />
        </div>
        <Experience />
        <div className="px-8 lg:px-14">
          <div className="h-px bg-[#1a2f50]" />
        </div>
        <Education />
        <div className="px-8 lg:px-14">
          <div className="h-px bg-[#1a2f50]" />
        </div>
        <Projects />
        <div className="px-8 lg:px-14">
          <div className="h-px bg-[#1a2f50]" />
        </div>
        <Music />
        <Contact />
      </main>
    </div>
  );
}
