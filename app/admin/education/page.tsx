'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  Check,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { formatMonth } from '@/app/lib/formatDate';

interface Study {
  id: number;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  current: number;
  description: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate: string;
  credentialUrl: string;
}

type Msg = { type: 'success' | 'error'; text: string } | null;

const inputCls =
  'w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors';
const labelCls = 'block text-xs font-mono text-slate-400 mb-1';
const Req = () => <span className="text-rose-400">*</span>;

export default function AdminEducationPage() {
  const [tab, setTab] = useState<'studies' | 'certs'>('studies');
  const [message, setMessage] = useState<Msg>(null);

  const switchTab = (t: 'studies' | 'certs') => {
    setTab(t);
    setMessage(null);
  };

  return (
    <div className="text-slate-100 p-4 sm:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3 border-b border-[#1a2f50] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#3b82f6]" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Education Admin</h1>
            </div>
            <p className="font-mono text-xs text-slate-500 mt-0.5">University studies and certifications</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(
            [
              ['studies', 'University Studies', GraduationCap],
              ['certs', 'Certifications', Award],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-semibold border transition-colors ${
                tab === key
                  ? 'bg-[#2563eb] border-[#2563eb] text-white'
                  : 'bg-[#0b1628] border-[#1a2f50] text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
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

        {tab === 'studies' ? <StudiesPanel setMessage={setMessage} /> : <CertsPanel setMessage={setMessage} />}
      </div>
    </div>
  );
}

/** Generic helpers shared by both panels. */
function useCollection<T>(url: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { items, loading, load };
}

async function send(url: string, method: 'POST' | 'PUT', body: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true } : { ok: false, error: data.error || 'An error occurred while saving.' };
  } catch {
    return { ok: false, error: 'Could not reach the server.' };
  }
}

async function remove(url: string, id: number, what: string, setMessage: (m: Msg) => void): Promise<boolean> {
  if (!confirm(`Are you sure you want to delete this ${what}?`)) return false;
  try {
    const res = await fetch(`${url}?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage({ type: 'success', text: `${what[0].toUpperCase()}${what.slice(1)} deleted.` });
      return true;
    }
    setMessage({ type: 'error', text: `Could not delete the ${what}.` });
  } catch {
    setMessage({ type: 'error', text: 'Could not reach the server.' });
  }
  return false;
}

function FormShell({
  editing,
  title,
  onCancel,
  children,
}: {
  editing: boolean;
  title: string;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`p-6 rounded-xl bg-[#0b1628] border space-y-6 ${editing ? 'border-[#c47d3b]' : 'border-[#1a2f50]'}`}>
      <div className="flex items-center justify-between border-b border-[#1a2f50] pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {editing ? <Pencil className="w-5 h-5 text-[#c47d3b]" /> : <Plus className="w-5 h-5 text-[#2563eb]" />}
          {editing ? `Edit ${title}` : `Add ${title}`}
        </h2>
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white bg-[#060f1e] px-2 py-1 rounded border border-[#1a2f50]"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function SubmitButton({ submitting, editing, label }: { submitting: boolean; editing: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className={`w-full py-2.5 px-4 rounded-md text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
        editing ? 'bg-[#c47d3b] hover:bg-[#b57032]' : 'bg-[#2563eb] hover:bg-[#1d4ed8]'
      }`}
    >
      {submitting ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
        </>
      ) : editing ? (
        <>
          <Pencil className="w-4 h-4" /> Update {label}
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" /> Save {label}
        </>
      )}
    </button>
  );
}

function ListShell({
  title,
  icon,
  count,
  loading,
  onReload,
  emptyText,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  loading: boolean;
  onReload: () => void;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 rounded-xl bg-[#0b1628] border border-[#1a2f50] space-y-4">
      <div className="flex items-center justify-between border-b border-[#1a2f50] pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {icon} {title} ({count})
        </h2>
        <button
          onClick={onReload}
          className="p-1.5 rounded bg-[#060f1e] border border-[#1a2f50] hover:border-[#2563eb] text-slate-400 hover:text-white"
          title="Reload"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {count === 0 ? (
        <div className="py-12 text-center text-slate-500 font-mono text-xs">{loading ? 'Loading...' : emptyText}</div>
      ) : (
        <div className="flex flex-col gap-3">{children}</div>
      )}
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={onEdit}
        className="flex items-center gap-1 text-xs text-[#3b82f6] hover:text-sky-300 font-mono p-1"
        title="Edit"
      >
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-mono p-1"
        title="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  );
}

// ── University studies ───────────────────────────────────────────────
function StudiesPanel({ setMessage }: { setMessage: (m: Msg) => void }) {
  const { items, loading, load } = useCollection<Study>('/api/education');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);
  const [description, setDescription] = useState('');

  const reset = () => {
    setEditingId(null);
    setDegree('');
    setInstitution('');
    setStartDate('');
    setEndDate('');
    setCurrent(false);
    setDescription('');
  };

  const edit = (s: Study) => {
    setEditingId(s.id);
    setDegree(s.degree);
    setInstitution(s.institution);
    setStartDate(s.startDate);
    setEndDate(s.endDate);
    setCurrent(!!s.current);
    setDescription(s.description);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    const isEditing = editingId !== null;
    const r = await send('/api/education', isEditing ? 'PUT' : 'POST', {
      ...(isEditing ? { id: editingId } : {}),
      degree,
      institution,
      startDate,
      endDate,
      current,
      description,
    });
    setSubmitting(false);
    if (r.ok) {
      setMessage({ type: 'success', text: isEditing ? 'Education updated!' : 'Education added!' });
      reset();
      load();
    } else {
      setMessage({ type: 'error', text: r.error! });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5">
        <FormShell editing={editingId !== null} title="Studies" onCancel={reset}>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={labelCls}>
                Degree / Program <Req />
              </label>
              <input
                required
                className={inputCls}
                placeholder="e.g. B.S. in Computer Science"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>
                Institution <Req />
              </label>
              <input
                required
                className={inputCls}
                placeholder="e.g. University of Somewhere"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Start Date <Req />
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
              I&apos;m currently studying here
            </label>
            <div>
              <label className={labelCls}>Description (optional)</label>
              <textarea
                rows={5}
                className={`${inputCls} resize-y leading-relaxed`}
                placeholder="Focus areas, thesis, honors..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <SubmitButton submitting={submitting} editing={editingId !== null} label="Studies" />
          </form>
        </FormShell>
      </div>

      <div className="lg:col-span-7">
        <ListShell
          title="University Studies"
          icon={<GraduationCap className="w-5 h-5 text-[#c47d3b]" />}
          count={items.length}
          loading={loading}
          onReload={load}
          emptyText="No studies yet. Add one with the form!"
        >
          {items.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-lg bg-[#060f1e] border ${editingId === s.id ? 'border-[#c47d3b]' : 'border-[#1a2f50]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm">{s.degree}</p>
                  <p className="text-slate-500 text-xs">{s.institution}</p>
                  <p className="font-mono text-xs text-slate-600 mt-1">
                    {formatMonth(s.startDate)} – {s.current ? 'In progress' : formatMonth(s.endDate)}
                  </p>
                </div>
                <RowActions
                  onEdit={() => edit(s)}
                  onDelete={async () => {
                    if (await remove('/api/education', s.id, 'study entry', setMessage)) {
                      if (editingId === s.id) reset();
                      load();
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </ListShell>
      </div>
    </div>
  );
}

// ── Certifications ───────────────────────────────────────────────────
function CertsPanel({ setMessage }: { setMessage: (m: Msg) => void }) {
  const { items, loading, load } = useCollection<Certification>('/api/certifications');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [noExpiration, setNoExpiration] = useState(true);
  const [credentialUrl, setCredentialUrl] = useState('');

  const reset = () => {
    setEditingId(null);
    setName('');
    setIssuer('');
    setIssueDate('');
    setExpirationDate('');
    setNoExpiration(true);
    setCredentialUrl('');
  };

  const edit = (c: Certification) => {
    setEditingId(c.id);
    setName(c.name);
    setIssuer(c.issuer);
    setIssueDate(c.issueDate);
    setExpirationDate(c.expirationDate);
    setNoExpiration(!c.expirationDate);
    setCredentialUrl(c.credentialUrl);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    const isEditing = editingId !== null;
    const r = await send('/api/certifications', isEditing ? 'PUT' : 'POST', {
      ...(isEditing ? { id: editingId } : {}),
      name,
      issuer,
      issueDate,
      expirationDate,
      noExpiration,
      credentialUrl,
    });
    setSubmitting(false);
    if (r.ok) {
      setMessage({ type: 'success', text: isEditing ? 'Certification updated!' : 'Certification added!' });
      reset();
      load();
    } else {
      setMessage({ type: 'error', text: r.error! });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5">
        <FormShell editing={editingId !== null} title="Certification" onCancel={reset}>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={labelCls}>
                Certification Name <Req />
              </label>
              <input
                required
                className={inputCls}
                placeholder="e.g. AWS Certified Solutions Architect"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>
                Issuing Organization <Req />
              </label>
              <input
                required
                className={inputCls}
                placeholder="e.g. Amazon Web Services"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Issue Date <Req />
                </label>
                <input
                  type="month"
                  required
                  className={inputCls}
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Expiration Date</label>
                <input
                  type="month"
                  required={!noExpiration}
                  disabled={noExpiration}
                  min={issueDate || undefined}
                  className={`${inputCls} disabled:opacity-40`}
                  value={noExpiration ? '' : expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noExpiration}
                onChange={(e) => setNoExpiration(e.target.checked)}
                className="accent-[#2563eb] w-4 h-4"
              />
              This certification does not expire
            </label>
            <div>
              <label className={labelCls}>Credential URL (optional)</label>
              <input
                type="url"
                className={inputCls}
                placeholder="https://..."
                value={credentialUrl}
                onChange={(e) => setCredentialUrl(e.target.value)}
              />
            </div>
            <SubmitButton submitting={submitting} editing={editingId !== null} label="Certification" />
          </form>
        </FormShell>
      </div>

      <div className="lg:col-span-7">
        <ListShell
          title="Certifications"
          icon={<Award className="w-5 h-5 text-[#c47d3b]" />}
          count={items.length}
          loading={loading}
          onReload={load}
          emptyText="No certifications yet. The section stays hidden on the site until you add one."
        >
          {items.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-lg bg-[#060f1e] border ${editingId === c.id ? 'border-[#c47d3b]' : 'border-[#1a2f50]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm">{c.name}</p>
                  <p className="text-slate-500 text-xs">{c.issuer}</p>
                  <p className="font-mono text-xs text-slate-600 mt-1">
                    Issued {formatMonth(c.issueDate)}
                    {c.expirationDate && ` · Expires ${formatMonth(c.expirationDate)}`}
                  </p>
                  {c.credentialUrl && (
                    <a
                      href={c.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs font-mono text-slate-500 hover:text-white"
                    >
                      <ExternalLink className="w-3 h-3" /> Credential
                    </a>
                  )}
                </div>
                <RowActions
                  onEdit={() => edit(c)}
                  onDelete={async () => {
                    if (await remove('/api/certifications', c.id, 'certification', setMessage)) {
                      if (editingId === c.id) reset();
                      load();
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </ListShell>
      </div>
    </div>
  );
}
