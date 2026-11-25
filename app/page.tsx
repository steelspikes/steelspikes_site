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
        <div className="max-w-6xl">
          <Hero />
          <Skills />
          <Experience />
          <Education />
          <Projects />
          <Music />
          <Contact />
        </div>
      </main>
    </div>
  );
}
