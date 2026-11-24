'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
    router.refresh();
  };
  return (
    <button onClick={logout} className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-red-400">
      <LogOut className="w-3.5 h-3.5" /> Log out
    </button>
  );
}
