'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { skillIcons, DEFAULT_SKILL_ICON } from '@/app/lib/skillIcons';

interface SkillGroup {
  id: number;
  icon: string;
  title: string;
  description: string;
  skills: string[];
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors';
const labelCls = 'block text-xs font-mono text-slate-400 mb-1';

export default function AdminSkillsPage() {
  const [groups, setGroups] = useState<SkillGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [icon, setIcon] = useState(DEFAULT_SKILL_ICON);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      if (res.ok) setGroups(await res.json());
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
    setIcon(DEFAULT_SKILL_ICON);
    setTitle('');
    setDescription('');
    setSkills([]);
    setSkillInput('');
  };

  const handleEdit = (g: SkillGroup) => {
    setEditingId(g.id);
    setIcon(g.icon);
    setTitle(g.title);
    setDescription(g.description);
    setSkills(g.skills);
    setSkillInput('');
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Adds one or more comma-separated skills from the input (no duplicates). */
  const addSkills = (raw: string) => {
    const incoming = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (incoming.length === 0) return;
    setSkills((prev) => {
      const next = [...prev];
      for (const s of incoming) {
        if (!next.some((x) => x.toLowerCase() === s.toLowerCase())) next.push(s);
      }
      return next;
    });
    setSkillInput('');
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setMessage(null);
    setSubmitting(true);
    // Include whatever is still typed in the skill box
    const pending = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const finalSkills = [...skills, ...pending.filter((p) => !skills.some((s) => s.toLowerCase() === p.toLowerCase()))];
    try {
      const isEditing = editingId !== null;
      const res = await fetch('/api/skills', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEditing ? { id: editingId } : {}),
          icon,
          title,
          description,
          skills: finalSkills,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ type: 'success', text: isEditing ? 'Skill group updated!' : 'Skill group added!' });
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

  const handleDelete = async (g: SkillGroup) => {
    if (!confirm(`Delete the group "${g.title}" and all its skills?`)) return;
    try {
      const res = await fetch(`/api/skills?id=${g.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Skill group deleted.' });
        if (editingId === g.id) resetForm();
        load();
      } else {
        setMessage({ type: 'error', text: 'Could not delete the group.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= groups.length) return;
    const next = [...groups];
    [next[index], next[target]] = [next[target], next[index]];
    setGroups(next); // optimistic
    try {
      const res = await fetch('/api/skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: next.map((g) => g.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setMessage({ type: 'error', text: 'Could not save the new order.' });
      load();
    }
  };

  return (
    <div className="text-slate-100 p-4 sm:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3 border-b border-[#1a2f50] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3b82f6]" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Skills Admin</h1>
            </div>
            <p className="font-mono text-xs text-slate-500 mt-0.5">Create groups and add skills inside them</p>
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
                      <Pencil className="w-5 h-5 text-[#c47d3b]" /> Edit Group
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-[#2563eb]" /> New Group
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
                    Group Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    required
                    className={inputCls}
                    placeholder="e.g. Backend Development"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Description (optional)</label>
                  <textarea
                    rows={3}
                    className={`${inputCls} resize-y leading-relaxed`}
                    placeholder="A short line about this group"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Icon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.entries(skillIcons).map(([name, Icon]) => (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        aria-label={name}
                        aria-pressed={icon === name}
                        onClick={() => setIcon(name)}
                        className={`h-10 rounded-md border flex items-center justify-center transition-colors ${
                          icon === name
                            ? 'bg-[#2563eb]/20 border-[#2563eb] text-[#3b82f6]'
                            : 'bg-[#060f1e] border-[#1a2f50] text-slate-500 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Skills</label>
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      placeholder="Type a skill and press Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addSkills(skillInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addSkills(skillInput)}
                      className="px-3 rounded-md bg-[#060f1e] border border-[#1a2f50] hover:border-[#2563eb] text-slate-300 text-xs font-mono"
                    >
                      Add
                    </button>
                  </div>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded bg-[#060f1e] text-slate-300 text-[11px] font-mono border border-[#1a2f50]"
                        >
                          {s}
                          <button
                            type="button"
                            aria-label={`Remove ${s}`}
                            onClick={() => setSkills(skills.filter((x) => x !== s))}
                            className="p-0.5 text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] font-mono text-slate-600 mt-2">
                      No skills yet. You can paste several separated by commas.
                    </p>
                  )}
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
                      <Pencil className="w-4 h-4" /> Update Group
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Group
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
                  <Layers className="w-5 h-5 text-[#c47d3b]" /> Groups ({groups.length})
                </h2>
                <button
                  onClick={load}
                  className="p-1.5 rounded bg-[#060f1e] border border-[#1a2f50] hover:border-[#2563eb] text-slate-400 hover:text-white"
                  title="Reload"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  {loading ? 'Loading...' : 'No groups yet. Create one with the form!'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {groups.map((g, i) => {
                    const Icon = skillIcons[g.icon] ?? skillIcons[DEFAULT_SKILL_ICON];
                    return (
                      <div
                        key={g.id}
                        className={`p-4 rounded-lg bg-[#060f1e] border transition-colors ${
                          editingId === g.id ? 'border-[#c47d3b]' : 'border-[#1a2f50]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-md bg-[#0b1628] border border-[#2563eb] flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-[#3b82f6]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-sm">{g.title}</p>
                              {g.description && (
                                <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{g.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => move(i, -1)}
                              disabled={i === 0}
                              className="p-1 text-slate-500 hover:text-white disabled:opacity-25"
                              title="Move up"
                              aria-label="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => move(i, 1)}
                              disabled={i === groups.length - 1}
                              className="p-1 text-slate-500 hover:text-white disabled:opacity-25"
                              title="Move down"
                              aria-label="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEdit(g)}
                              className="flex items-center gap-1 text-xs text-[#3b82f6] hover:text-sky-300 font-mono p-1"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(g)}
                              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-mono p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                        {g.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {g.skills.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 rounded bg-[#0b1628] text-slate-500 text-[11px] font-mono border border-[#1a2f50]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
