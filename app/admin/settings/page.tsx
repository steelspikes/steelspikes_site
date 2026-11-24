import { KeyRound } from 'lucide-react';
import ChangePassword from '@/app/admin/ChangePassword';

export default function AdminSettingsPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-xl space-y-8">
      <header className="border-b border-[#1a2f50] pb-6">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#3b82f6]" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        </div>
        <p className="font-mono text-xs text-slate-500 mt-0.5">Account and security</p>
      </header>
      <ChangePassword />
    </div>
  );
}
