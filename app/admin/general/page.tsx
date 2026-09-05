'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Disc,
  ArrowLeft,
  ExternalLink,
  Check,
  AlertCircle,
  RefreshCw,
  Save,
  FileText,
  Share2,
  Sliders,
} from 'lucide-react';
import {
  LinkedInIcon,
  GitHubIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  BandcampIcon,
  SpotifyIcon,
} from '@/app/components/SocialIcons';

interface ProfileData {
  name: string;
  role: string;
  heroSubtitle: string;
  avatarUrl: string;
  cvUrl: string;
  musicIntro: string;
  socialLinks: {
    linkedin: string;
    github: string;
    facebook: string;
    instagram: string;
    youtube: string;
    bandcamp: string;
    spotify: string;
    email: string;
  };
}

export default function AdminGeneralPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [musicIntro, setMusicIntro] = useState('');

  // Social links
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [bandcamp, setBandcamp] = useState('');
  const [spotify, setSpotify] = useState('');
  const [email, setEmail] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data: ProfileData = await res.json();
        setName(data.name || '');
        setRole(data.role || '');
        setHeroSubtitle(data.heroSubtitle || '');
        setAvatarUrl(data.avatarUrl || '');
        setCvUrl(data.cvUrl || '');
        setMusicIntro(data.musicIntro || '');

        const s = data.socialLinks || {
          linkedin: '',
          github: '',
          facebook: '',
          instagram: '',
          youtube: '',
          bandcamp: '',
          spotify: '',
          email: '',
        };
        setLinkedin(s.linkedin || '');
        setGithub(s.github || '');
        setFacebook(s.facebook || '');
        setInstagram(s.instagram || '');
        setYoutube(s.youtube || '');
        setBandcamp(s.bandcamp || '');
        setSpotify(s.spotify || '');
        setEmail(s.email || '');
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'No se pudo cargar la configuración de la base de datos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name || !role || !heroSubtitle) {
      setMessage({ type: 'error', text: 'Nombre, Rol y Descripción son campos obligatorios (*).' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          role,
          heroSubtitle,
          avatarUrl,
          cvUrl,
          musicIntro,
          socialLinks: {
            linkedin,
            github,
            facebook,
            instagram,
            youtube,
            bandcamp,
            spotify,
            email,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '¡Configuración general guardada exitosamente en SQLite!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar los cambios.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060f1e] text-slate-100 p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a2f50] pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] text-slate-400 hover:text-white transition-colors"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#3b82f6]" />
                <h1 className="text-2xl font-bold text-white tracking-tight">Configuración General</h1>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-0.5">
                Edita tus datos personales, foto, redes y CV persistidos en SQLite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/disks"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0b1628] border border-[#1a2f50] hover:border-[#c47d3b] text-slate-300 hover:text-[#c47d3b] text-xs font-mono transition-colors"
            >
              <Disc className="w-3.5 h-3.5" /> Administrar Discos
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0b1628] border border-[#1a2f50] hover:border-[#2563eb] text-slate-300 hover:text-white text-xs font-mono transition-colors"
            >
              Ver Sitio <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Notification Alert */}
        {message && (
          <div
            className={`p-4 rounded-lg flex items-center justify-between gap-3 text-sm font-mono border ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Cargando datos de perfil desde SQLite...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* 1. Información de Perfil */}
            <div className="p-6 rounded-xl bg-[#0b1628] border border-[#1a2f50] space-y-6">
              <div className="flex items-center gap-2 border-b border-[#1a2f50] pb-3">
                <User className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-base font-bold text-white">1. Información Personal & Avatar</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Nombre Completo <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Rol / Título Profesional <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Software Engineer & Sound Explorer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Avatar URL + Live Preview */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    URL de la Foto / Avatar (Opcional)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/tu-foto.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="flex-1 w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                    />
                    <div className="flex items-center gap-3 p-2 rounded-md bg-[#060f1e] border border-[#1a2f50] shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#0b1628] border-2 border-[#2563eb] overflow-hidden flex items-center justify-center">
                        {avatarUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={avatarUrl}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-lg font-bold text-[#3b82f6]">
                            {name ? name.charAt(0) : '?'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono pr-2">Vista previa de avatar</span>
                    </div>
                  </div>
                </div>

                {/* CV Link */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Enlace al CV (URL o archivo local)
                  </label>
                  <input
                    type="text"
                    placeholder="/cv.pdf o https://drive.google.com/..."
                    value={cvUrl}
                    onChange={(e) => setCvUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Descripciones */}
            <div className="p-6 rounded-xl bg-[#0b1628] border border-[#1a2f50] space-y-6">
              <div className="flex items-center gap-2 border-b border-[#1a2f50] pb-3">
                <FileText className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-base font-bold text-white">2. Textos & Descripciones</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Descripción General / Subtítulo Hero <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Sintetiza tu trabajo en ingeniería y faceta musical..."
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Introducción a la Sección de Música
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Breve texto sobre tu proceso creativo / música..."
                    value={musicIntro}
                    onChange={(e) => setMusicIntro(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Redes y Plataformas */}
            <div className="p-6 rounded-xl bg-[#0b1628] border border-[#1a2f50] space-y-6">
              <div className="flex items-center gap-2 border-b border-[#1a2f50] pb-3">
                <Share2 className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-base font-bold text-white">3. Redes & Enlaces a Plataformas</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LinkedIn */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <LinkedInIcon className="w-3.5 h-3.5 text-[#3b82f6]" /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/tu-usuario"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* GitHub */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <GitHubIcon className="w-3.5 h-3.5 text-[#3b82f6]" /> GitHub URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/tu-usuario"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <FacebookIcon className="w-3.5 h-3.5 text-[#3b82f6]" /> Facebook URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/tu-perfil"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <InstagramIcon className="w-3.5 h-3.5 text-[#3b82f6]" /> Instagram URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/tu-usuario"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <YouTubeIcon className="w-3.5 h-3.5 text-[#3b82f6]" /> YouTube URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@tu-canal"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Bandcamp */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <BandcampIcon className="w-3.5 h-3.5 text-[#3b82f6]" /> Bandcamp URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://tu-nombre.bandcamp.com"
                    value={bandcamp}
                    onChange={(e) => setBandcamp(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Spotify */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <SpotifyIcon className="w-3.5 h-3.5 text-[#3b82f6]" /> Spotify URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://open.spotify.com/artist/..."
                    value={spotify}
                    onChange={(e) => setSpotify(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Correo Electrónico (Contacto)
                  </label>
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Guardando en SQLite...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Guardar Todos los Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
