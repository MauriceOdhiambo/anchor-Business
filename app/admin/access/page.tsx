import { redirect } from 'next/navigation';
import { requireAdmin, isOwner } from '@/lib/admin';
import { AdminShell } from '@/components/AdminShell';
import { AdminAccess } from '@/components/AdminAccess';

export const dynamic = 'force-dynamic';

export default async function AccessControlPage() {
  const { user, db, role } = await requireAdmin();
  if (!user) redirect('/admin/login');
  if (!isOwner(user.email)) redirect('/admin');
  if (!db) return <main className="admin-shell"><div className="admin-error-card">Supabase server configuration is incomplete. Check the Vercel environment variables.</div></main>;
  return <AdminShell email={user.email || ''} role={role || 'owner'} owner>
    <header className="admin-header"><div><span className="admin-kicker">Security & permissions</span><h1>Access control</h1><p>Create administrators, assign permissions, reset passwords and suspend access from one place.</p></div></header>
    <AdminAccess currentEmail={user.email || ''} canManage />
  </AdminShell>;
}
