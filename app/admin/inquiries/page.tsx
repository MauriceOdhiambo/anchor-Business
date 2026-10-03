import { redirect } from 'next/navigation';
import { requireAdmin, isOwner } from '@/lib/admin';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable } from '@/components/AdminTable';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  const { user, db, role } = await requireAdmin();
  if (!user) redirect('/admin/login');
  if (!db) return <main className="admin-shell"><div className="admin-error-card">Supabase server configuration is incomplete. Check the Vercel environment variables.</div></main>;
  const { data, error } = await db.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) return <main className="admin-shell"><div className="admin-error-card">Could not load enquiries. Check the Supabase table and server credentials.</div></main>;
  return <AdminShell email={user.email || ''} role={role || 'admin'} owner={isOwner(user.email)}>
    <header className="admin-header"><div><span className="admin-kicker">Client management</span><h1>Inquiries</h1></div></header>
    <section className="admin-panel"><AdminTable submissions={data || []} /></section>
  </AdminShell>;
}
