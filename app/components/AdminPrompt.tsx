'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

/** Small alert-style prompt that asks for the admin password. */
export default function AdminPrompt({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onClose();
        router.push('/admin');
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Login failed');
      setPassword('');
      inputRef.current?.focus();
    } catch {
      setError('Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
      role="presentation"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Admin access"
        className="w-full max-w-xs rounded-lg bg-[#0b1628] border border-[#1a2f50] p-5 shadow-2xl flex flex-col gap-3"
      >
        <div className="flex items-center gap-2 text-white text-sm font-semibold">
          <Lock className="w-4 h-4 text-[#3b82f6]" /> Admin access
        </div>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] outline-none px-3 py-2 text-sm text-white font-mono"
        />
        {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-mono text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !password}
            className="px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white"
          >
            {busy ? '...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
