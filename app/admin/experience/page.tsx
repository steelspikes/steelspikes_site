'use client';

import { useCallback, useEffect, useState } from 'react';
import { Briefcase, Check, AlertCircle, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { formatMonth } from '@/app/lib/formatDate';

interface Experience {
  id: number;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  current: number;
  modality: string;
  description: string;
}

const MODALITIES = ['On-site', 'Remote', 'Hybrid'];

const inputCls =
  'w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors';
const labelCls = 'block text-xs font-mono text-slate-400 mb-1';

export default function AdminExperiencePage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);
  const [modality, setModality] = useState(MODALITIES[0]);
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/experience');
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setRole('');
    setCompany('');
    setStartDate('');
    setEndDate('');
    setCurrent(false);
    setModality(MODALITIES[0]);
    setDescription('');
  };

  const handleEdit = (e: Experience) => {
    setEditingId(e.id);
    setRole(e.role);
    setCompany(e.company);
    setStartDate(e.startDate);
    setEndDate(e.endDate);
    setCurrent(!!e.current);
    setModality(e.modality);
    setDescription(e.description);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const isEditing = editingId !== null;
      const res = await fetch('/api/experience', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEditing ? { id: editingId } : {}),
          role,
          company,
          startDate,
          endDate,
          current,
          modality,
          description,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ type: 'success', text: isEditing ? 'Experience updated!' : 'Experience added!' });
        resetForm();
        load();
      } else {
        setMessage({ type: 'error', text: data.error || 'An error occurred while saving.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      const res = await fetch(`/api/experience?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Experience deleted.' });
        if (editingId === id) resetForm();
        load();
      } else {
        setMessage({ type: 'error', text: 'Could not delete the experience.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    }
  };

  return (
    <div className="text-slate-100 p-4 sm:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3 border-b border-[#1a2f50] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#3b82f6]" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Experience Admin</h1>
            </div>
            <p className="font-mono text-xs text-slate-500 mt-0.5">Manage the work history shown on the site</p>
          </div>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5">
            <div
              className={`p-6 rounded-xl bg-[#0b1628] border space-y-6 ${
                editingId ? 'border-[#c47d3b]' : 'border-[#1a2f50]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#1a2f50] pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {editingId ? (
                    <>
                      <Pencil className="w-5 h-5 text-[#c47d3b]" /> Edit Experience
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-[#2563eb]" /> Add Experience
                    </>
                  )}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white bg-[#060f1e] px-2 py-1 rounded border border-[#1a2f50]"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>
                    Job Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    required
                    className={inputCls}
                    placeholder="e.g. Senior Backend Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Company <span className="text-rose-400">*</span>
                  </label>
                  <input
                    required
                    className={inputCls}
                    placeholder="e.g. Acme Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>
                      Start Date <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="month"
                      required
                      className={inputCls}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input
                      type="month"
                      required={!current}
                      disabled={current}
                      min={startDate || undefined}
                      className={`${inputCls} disabled:opacity-40`}
                      value={current ? '' : endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={current}
                    onChange={(e) => setCurrent(e.target.checked)}
                    className="accent-[#2563eb] w-4 h-4"
                  />
                  I currently work here
                </label>

                <div>
                  <label className={labelCls}>
                    Work Modality <span className="text-rose-400">*</span>
                  </label>
                  <select className={inputCls} value={modality} onChange={(e) => setModality(e.target.value)}>
                    {MODALITIES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Job Description</label>
                  <textarea
                    rows={8}
                    className={`${inputCls} resize-y leading-relaxed`}
                    placeholder="What did you do? Separate paragraphs with a blank line."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-2.5 px-4 rounded-md text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                    editingId ? 'bg-[#c47d3b] hover:bg-[#b57032]' : 'bg-[#2563eb] hover:bg-[#1d4ed8]'
                  }`}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Pencil className="w-4 h-4" /> Update Experience
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Experience
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-7">
            <div className="p-6 rounded-xl bg-[#0b1628] border border-[#1a2f50] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1a2f50] pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#c47d3b]" /> Experience ({items.length})
                </h2>
                <button
                  onClick={load}
                  className="p-1.5 rounded bg-[#060f1e] border border-[#1a2f50] hover:border-[#2563eb] text-slate-400 hover:text-white"
                  title="Reload"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  {loading ? 'Loading...' : 'No experience yet. Add one with the form!'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((exp) => (
                    <div
                      key={exp.id}
                      className={`p-4 rounded-lg bg-[#060f1e] border transition-colors ${
                        editingId === exp.id ? 'border-[#c47d3b]' : 'border-[#1a2f50]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm">{exp.role}</p>
                          <p className="text-slate-500 text-xs">{exp.company}</p>
                          <p className="font-mono text-xs text-slate-600 mt-1">
                            {formatMonth(exp.startDate)} – {exp.current ? 'Present' : formatMonth(exp.endDate)} ·{' '}
                            {exp.modality}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEdit(exp)}
                            className="flex items-center gap-1 text-xs text-[#3b82f6] hover:text-sky-300 font-mono p-1"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-mono p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-slate-400 text-xs leading-relaxed mt-3 whitespace-pre-line line-clamp-4">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
