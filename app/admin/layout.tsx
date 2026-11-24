import { redirect } from 'next/navigation';
import { isAdmin } from '@/app/lib/auth';
import AdminShell from '@/app/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect('/');
  return <AdminShell>{children}</AdminShell>;
}
