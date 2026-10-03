import { redirect } from 'next/navigation';
import { requireAdmin, isOwner } from '@/lib/admin';
import { AdminShell } from '@/components/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { user, db, role } = await requireAdmin();
  if (!user) redirect('/admin/login');
  if (!db) return <main className="admin-shell"><div className="admin-error-card">Supabase server configuration is incomplete. Check the Vercel environment variables.</div></main>;

  const { data, error } = await db.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) return <main className="admin-shell"><div className="admin-error-card">Could not load enquiries. Check the Supabase table and server credentials.</div></main>;

  const enquiries = data || [];
  const total = enquiries.length;
  const counts = {
    new: enquiries.filter(x => x.status === 'new').length,
    contacted: enquiries.filter(x => x.status === 'contacted').length,
    qualified: enquiries.filter(x => x.status === 'qualified').length,
    closed: enquiries.filter(x => x.status === 'closed').length,
  };
  const serviceCounts = Object.entries(enquiries.reduce<Record<string, number>>((acc, item) => {
    const key = item.service || 'General enquiry';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const owner = isOwner(user.email);

  return <AdminShell email={user.email || ''} role={role || 'admin'} owner={owner}>
    <header className="admin-header">
      <div><span className="admin-kicker">Overview</span><h1>Dashboard</h1><p>Business development insights and client enquiry performance.</p></div>
    </header>

    <section className="admin-insight-hero">
      <div><span className="admin-kicker">Client pipeline</span><h2>Know what needs attention.</h2><p>Track every enquiry from first contact to completion without leaving the control centre.</p></div>
      <div className="admin-hero-metric"><span>Total enquiries</span><strong>{total}</strong><small>Recorded enquiries</small></div>
    </section>

    <section className="admin-stat-grid" aria-label="Enquiry statistics">
      <div className="admin-stat-card accent-gold"><span>Total enquiries</span><strong>{total}</strong><small>All recorded enquiries</small></div>
      <div className="admin-stat-card"><span>New</span><strong>{counts.new}</strong><small>Awaiting first response</small></div>
      <div className="admin-stat-card"><span>Contacted</span><strong>{counts.contacted}</strong><small>Initial contact made</small></div>
      <div className="admin-stat-card"><span>Qualified</span><strong>{counts.qualified}</strong><small>Active opportunities</small></div>
      <div className="admin-stat-card"><span>Closed</span><strong>{counts.closed}</strong><small>Completed or closed</small></div>
    </section>

    <section className="admin-insights-grid">
      <div className="admin-panel">
        <div className="admin-panel-head"><div><span className="admin-kicker">Client journey</span><h3>Enquiry progress</h3></div><span className="admin-panel-note">{total ? `${Math.round((counts.closed / total) * 100)}% closed` : 'No activity yet'}</span></div>
        <div className="pipeline-list">
          {[['new','New enquiry','gold'],['contacted','Contacted','blue'],['qualified','Qualified','green'],['closed','Closed','slate']].map(([key,label,tone]) => {
            const count = counts[key as keyof typeof counts];
            return <div className="pipeline-row" key={key}><div className="pipeline-label"><span className={`pipeline-dot ${tone}`}></span><span>{label}</span><strong>{count}</strong></div><div className="pipeline-track"><span className={`pipeline-fill ${tone}`} style={{ width: `${total ? Math.max((count / total) * 100, count ? 4 : 0) : 0}%` }} /></div></div>;
          })}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head"><div><span className="admin-kicker">Demand insight</span><h3>Services requested</h3></div></div>
        <div className="service-insight-list">{serviceCounts.length ? serviceCounts.map(([name, count]) => <div className="service-insight-row" key={name}><div><strong>{name}</strong><span>{count} {count === 1 ? 'enquiry' : 'enquiries'}</span></div><div className="service-mini-track"><span style={{ width: `${serviceCounts[0][1] ? (count / serviceCounts[0][1]) * 100 : 0}%` }} /></div></div>) : <p className="admin-muted">Service demand will appear here after enquiries arrive.</p>}</div>
      </div>
    </section>

    <div className="admin-dashboard-actions"><a href="/admin/inquiries" className="admin-primary-button">Open inquiries</a>{owner && <a href="/admin/access" className="admin-secondary-button">Manage access</a>}</div>
  </AdminShell>;
}
