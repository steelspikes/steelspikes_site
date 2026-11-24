'use client';

import { useState, useEffect } from 'react';
import {
  User,
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
      setMessage({ type: 'error', text: 'Could not load the settings from the database.' });
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
      setMessage({ type: 'error', text: 'Name, role and description are required (*).' });
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
        setMessage({ type: 'success', text: 'General settings saved successfully!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error saving changes.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="text-slate-100 p-4 sm:p-8 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a2f50] pb-6">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#3b82f6]" />
                <h1 className="text-2xl font-bold text-white tracking-tight">General Settings</h1>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-0.5">
                Edit your personal info, photo, social links and CV
              </p>
            </div>
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
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading profile data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* 1. Profile info */}
            <div className="p-6 rounded-xl bg-[#0b1628] border border-[#1a2f50] space-y-6">
              <div className="flex items-center gap-2 border-b border-[#1a2f50] pb-3">
                <User className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-base font-bold text-white">1. Personal Info & Avatar</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Role / Professional Title <span className="text-rose-400">*</span>
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
                    Photo / Avatar URL (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <input
                      type="url"
                      placeholder="https://example.com/your-photo.jpg"
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
                      <span className="text-xs text-slate-400 font-mono pr-2">Avatar preview</span>
                    </div>
                  </div>
                </div>

                {/* CV Link */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    CV link (URL or local file)
                  </label>
                  <input
                    type="text"
                    placeholder="/cv.pdf or https://drive.google.com/..."
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
                <h2 className="text-base font-bold text-white">2. Texts & Descriptions</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Overview / Hero Subtitle <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Summarize your engineering work and your musical side..."
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Music Section Intro
                  </label>
                  <textarea
                    rows={2}
                    placeholder="A short text about your creative process / music..."
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
                <h2 className="text-base font-bold text-white">3. Social & Platform Links</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LinkedIn */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                    <LinkedInIcon className="w-3.5 h-3.5 text-[#3b82f6]" /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/your-username"
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
                    placeholder="https://github.com/your-username"
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
                    placeholder="https://facebook.com/your-profile"
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
                    placeholder="https://instagram.com/your-username"
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
                    placeholder="https://youtube.com/@your-channel"
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
                    placeholder="https://your-name.bandcamp.com"
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
                    Email (Contact)
                  </label>
                  <input
                    type="email"
                    placeholder="you@email.com"
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
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save All Changes
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
