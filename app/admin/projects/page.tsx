'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  FolderGit2,
  GitFork,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] text-white text-sm outline-none transition-colors';
const labelCls = 'block text-xs font-mono text-slate-400 mb-1';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) setProjects(await res.json());
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
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setGithubUrl('');
    setLiveUrl('');
    setImageUrl('');
  };

  const handleEdit = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setTags(p.tags);
    setTagInput('');
    setGithubUrl(p.githubUrl);
    setLiveUrl(p.liveUrl);
    setImageUrl(p.imageUrl);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const splitTags = (raw: string) =>
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const addTags = (raw: string) => {
    const incoming = splitTags(raw);
    if (incoming.length === 0) return;
    setTags((prev) => {
      const next = [...prev];
      for (const t of incoming) {
        if (!next.some((x) => x.toLowerCase() === t.toLowerCase())) next.push(t);
      }
      return next;
    });
    setTagInput('');
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setMessage(null);
    setSubmitting(true);
    // Include whatever is still typed in the tag box
    const finalTags = [...tags];
    for (const t of splitTags(tagInput)) {
      if (!finalTags.some((x) => x.toLowerCase() === t.toLowerCase())) finalTags.push(t);
    }
    try {
      const isEditing = editingId !== null;
      const res = await fetch('/api/projects', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEditing ? { id: editingId } : {}),
          title,
          description,
          tags: finalTags,
          githubUrl,
          liveUrl,
          imageUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ type: 'success', text: isEditing ? 'Project updated!' : 'Project added!' });
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

  const handleDelete = async (p: Project) => {
    if (!confirm(`Delete the project "${p.title}"?`)) return;
    try {
      const res = await fetch(`/api/projects?id=${p.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Project deleted.' });
        if (editingId === p.id) resetForm();
        load();
      } else {
        setMessage({ type: 'error', text: 'Could not delete the project.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    setProjects(next); // optimistic
    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: next.map((p) => p.id) }),
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
              <FolderGit2 className="w-5 h-5 text-[#3b82f6]" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Projects Admin</h1>
            </div>
            <p className="font-mono text-xs text-slate-500 mt-0.5">Manage the projects shown on the site</p>
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
                      <Pencil className="w-5 h-5 text-[#c47d3b]" /> Edit Project
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-[#2563eb]" /> Add Project
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
                    Project Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    required
                    className={inputCls}
                    placeholder="e.g. StreamSync API"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={5}
                    className={`${inputCls} resize-y leading-relaxed`}
                    placeholder="What problem does it solve?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Tags</label>
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addTags(tagInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addTags(tagInput)}
                      className="px-3 rounded-md bg-[#060f1e] border border-[#1a2f50] hover:border-[#2563eb] text-slate-300 text-xs font-mono"
                    >
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded bg-[#060f1e] text-slate-300 text-[11px] font-mono border border-[#1a2f50]"
                        >
                          {t}
                          <button
                            type="button"
                            aria-label={`Remove ${t}`}
                            onClick={() => setTags(tags.filter((x) => x !== t))}
                            className="p-0.5 text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Image URL</label>
                  <input
                    type="url"
                    className={inputCls}
                    placeholder="https://example.com/screenshot.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <div className="mt-2 aspect-video w-full rounded-md overflow-hidden bg-[#060f1e] border border-[#1a2f50]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        onLoad={(e) => ((e.target as HTMLElement).style.display = 'block')}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>GitHub URL</label>
                  <input
                    type="url"
                    className={inputCls}
                    placeholder="https://github.com/you/project"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Live Demo URL (optional)</label>
                  <input
                    type="url"
                    className={inputCls}
                    placeholder="https://project.example.com"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                  />
                  <p className="text-[11px] font-mono text-slate-600 mt-1">Leave empty and the button is hidden.</p>
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
                      <Pencil className="w-4 h-4" /> Update Project
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Project
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
                  <FolderGit2 className="w-5 h-5 text-[#c47d3b]" /> Projects ({projects.length})
                </h2>
                <button
                  onClick={load}
                  className="p-1.5 rounded bg-[#060f1e] border border-[#1a2f50] hover:border-[#2563eb] text-slate-400 hover:text-white"
                  title="Reload"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  {loading ? 'Loading...' : 'No projects yet. Add one with the form!'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {projects.map((p, i) => (
                    <div
                      key={p.id}
                      className={`p-4 rounded-lg bg-[#060f1e] border transition-colors ${
                        editingId === p.id ? 'border-[#c47d3b]' : 'border-[#1a2f50]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {p.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt=""
                              className="w-20 h-12 rounded object-cover bg-[#0b1628] border border-[#1a2f50] shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-sm">{p.title}</p>
                            {p.description && (
                              <p className="text-slate-500 text-xs leading-relaxed mt-0.5 line-clamp-2">
                                {p.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5">
                              {p.githubUrl && (
                                <a
                                  href={p.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-white"
                                >
                                  <GitFork className="w-3 h-3" /> GitHub
                                </a>
                              )}
                              {p.liveUrl && (
                                <a
                                  href={p.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-white"
                                >
                                  <ExternalLink className="w-3 h-3" /> Live
                                </a>
                              )}
                            </div>
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
                            disabled={i === projects.length - 1}
                            className="p-1 text-slate-500 hover:text-white disabled:opacity-25"
                            title="Move down"
                            aria-label="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(p)}
                            className="flex items-center gap-1 text-xs text-[#3b82f6] hover:text-sky-300 font-mono p-1"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-mono p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded bg-[#0b1628] text-slate-500 text-[11px] font-mono border border-[#1a2f50]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
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
