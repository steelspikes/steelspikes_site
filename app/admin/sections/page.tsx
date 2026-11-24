'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Check, RefreshCw, RotateCcw, Save, TextCursorInput, X } from 'lucide-react';
import { SECTION_DEFAULTS, SECTION_TEXTS, SECTION_TEXT_MAX, type SectionKey } from '@/app/lib/sectionTexts';

type Texts = Record<SectionKey, string>;

export default function AdminSectionsPage() {
  const [texts, setTexts] = useState<Texts>({ ...SECTION_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/sections')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => alive && setTexts({ ...SECTION_DEFAULTS, ...data }))
      .catch(() => alive && setMessage({ type: 'error', text: 'Could not load the saved texts.' }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTexts({ ...SECTION_DEFAULTS, ...data.texts });
        setMessage({ type: 'success', text: 'Section texts saved! Reload the site to see them.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'An error occurred while saving.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="text-slate-100 p-4 sm:p-8 lg:p-10 max-w-3xl space-y-8">
      <header className="border-b border-[#1a2f50] pb-6">
        <div className="flex items-center gap-2">
          <TextCursorInput className="w-5 h-5 text-[#3b82f6]" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Sections</h1>
        </div>
        <p className="font-mono text-xs text-slate-500 mt-0.5">
          Edit the subtext shown under each section title. Leave one empty to hide it.
        </p>
      </header>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between gap-3 text-sm font-mono border ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
          <button onClick={() => setMessage(null)} aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {SECTION_TEXTS.map((s) => {
            const value = texts[s.key];
            const isDefault = value === s.default;
            return (
              <div key={s.key} className="p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50] space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={`sub-${s.key}`} className="text-sm font-semibold text-white">
                    {s.label}
                  </label>
                  <button
                    type="button"
                    disabled={isDefault}
                    onClick={() => setTexts({ ...texts, [s.key]: s.default })}
                    className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500"
                    title="Restore the original text"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
                <textarea
                  id={`sub-${s.key}`}
                  rows={2}
                  maxLength={SECTION_TEXT_MAX}
                  value={value}
                  onChange={(e) => setTexts({ ...texts, [s.key]: e.target.value })}
                  placeholder="(no subtext)"
                  className="w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors resize-y leading-relaxed"
                />
                <p className="text-[11px] font-mono text-slate-600 text-right">
                  {value.length}/{SECTION_TEXT_MAX}
                </p>
              </div>
            );
          })}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-mono text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save All
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
