import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { AdminTable } from '@/components/AdminTable';
import { AdminAccess } from '@/components/AdminAccess';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const { user, db } = await requireAdmin();
  if (!user) redirect('/admin/login');
  if (!db) return <main className="admin-shell"><div className="container"><div className="notice">Supabase server configuration is incomplete. Add the service-role key to Vercel.</div></div></main>;
  const { data, error } = await db.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) return <main className="admin-shell"><div className="container"><div className="notice">Could not load enquiries. Check the Supabase table and server credentials.</div></div></main>;
  const enquiries = data || [];
  const stats = { total: enquiries.length, new: enquiries.filter(x => x.status === 'new').length, contacted: enquiries.filter(x => x.status === 'contacted').length, qualified: enquiries.filter(x => x.status === 'qualified').length, closed: enquiries.filter(x => x.status === 'closed').length };
  return <main className="admin-shell"><div className="container">
    <div className="admin-top"><div><span className="eyebrow">Private dashboard</span><h1>Enquiries</h1><p>Manage website enquiries, follow-ups and admin access.</p></div><form action="/api/admin/logout" method="post"><button className="button button-secondary">Sign out</button></form></div>
    <div className="admin-welcome">Signed in as <strong>{user.email}</strong></div>
    <div className="stats-grid"><div className="stat-card"><span>Total enquiries</span><strong>{stats.total}</strong></div><div className="stat-card stat-new"><span>New</span><strong>{stats.new}</strong></div><div className="stat-card"><span>Contacted</span><strong>{stats.contacted}</strong></div><div className="stat-card"><span>Qualified</span><strong>{stats.qualified}</strong></div><div className="stat-card"><span>Closed</span><strong>{stats.closed}</strong></div></div>
    <section className="admin-section"><div className="admin-section-head"><div><span className="eyebrow">Lead management</span><h2>Website enquiries</h2><p>Search, filter, open and update each enquiry from one place.</p></div></div><AdminTable submissions={enquiries} /></section>
    <AdminAccess currentEmail={user.email || ''} />
  </div></main>;
}
