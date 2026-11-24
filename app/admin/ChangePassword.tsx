'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';

const input =
  'w-full rounded-md bg-[#060f1e] border border-[#1a2f50] focus:border-[#2563eb] outline-none px-3 py-2 text-sm text-white font-mono';

export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) return setMsg({ ok: false, text: 'Confirmation does not match' });
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ ok: true, text: 'Password updated' });
        setCurrent('');
        setNext('');
        setConfirm('');
      } else {
        setMsg({ ok: false, text: data.error || 'Could not update password' });
      }
    } catch {
      setMsg({ ok: false, text: 'Could not reach the server' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-5 rounded-lg bg-[#0b1628] border border-[#1a2f50]">
      <div className="flex items-center gap-2 text-white text-sm font-semibold">
        <KeyRound className="w-4 h-4 text-[#c47d3b]" /> Change password
      </div>
      <input type="password" className={input} placeholder="Current password" autoComplete="current-password"
        value={current} onChange={(e) => setCurrent(e.target.value)} required />
      <input type="password" className={input} placeholder="New password" autoComplete="new-password"
        value={next} onChange={(e) => setNext(e.target.value)} required />
      <input type="password" className={input} placeholder="Confirm new password" autoComplete="new-password"
        value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      {msg && <p className={`text-xs font-mono ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
      <button
        type="submit"
        disabled={busy}
        className="self-start px-4 py-2 rounded-md text-xs font-mono font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white"
      >
        {busy ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
