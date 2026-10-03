import { redirect } from 'next/navigation';
import { requireAdmin, isOwner } from '@/lib/admin';
import { AdminTable } from '@/components/AdminTable';
import { AdminAccess } from '@/components/AdminAccess';
import { Chart, Shield, Spark } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const { user, db, role } = await requireAdmin();
  const canSeeInsights = isOwner(user?.email) || role !== 'manager';
  if (!user) redirect('/admin/login');
  if (!db) return <main className="admin-shell"><div className="admin-error-card">Supabase server configuration is incomplete. Add the service-role key to Vercel.</div></main>;
  const { data, error } = await db.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) return <main className="admin-shell"><div className="admin-error-card">Could not load enquiries. Check the Supabase table and server credentials.</div></main>;

  const enquiries = data || [];
  const stats = {
    total: enquiries.length,
    new: enquiries.filter(x => x.status === 'new').length,
    contacted: enquiries.filter(x => x.status === 'contacted').length,
    qualified: enquiries.filter(x => x.status === 'qualified').length,
    closed: enquiries.filter(x => x.status === 'closed').length,
  };
  const serviceCounts = Object.entries(enquiries.reduce<Record<string, number>>((acc, item) => { const key = item.service || 'General enquiry'; acc[key] = (acc[key] || 0) + 1; return acc; }, {})).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const pipeline = [
    { key: 'new', label: 'New enquiry', count: stats.new, tone: 'gold' },
    { key: 'contacted', label: 'Contacted', count: stats.contacted, tone: 'blue' },
    { key: 'qualified', label: 'Qualified', count: stats.qualified, tone: 'green' },
    { key: 'closed', label: 'Closed', count: stats.closed, tone: 'slate' },
  ];
  const recent = enquiries.slice(0, 5);

  return <main className="admin-shell">
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span className="admin-brand-mark">A</span><div><strong>Anchor</strong><span>Business Insights</span></div></div>
        <div className="admin-sidebar-label">Workspace</div>
        <nav className="admin-nav" aria-label="Admin menu">
          {canSeeInsights && <a className="active" href="#dashboard"><span><Chart /></span>Dashboard</a>}
          <a className={!canSeeInsights ? 'active' : ''} href="#inquiries"><span>◫</span>Inquiries</a>
          {isOwner(user.email) && <a href="#access"><span><Shield /></span>Access control</a>}
        </nav>
        <div className="admin-sidebar-footer"><div className="admin-user-mini"><span>{user.email?.slice(0,1).toUpperCase()}</span><div><strong>{user.email}</strong><small>{isOwner(user.email) ? 'Primary administrator' : 'Administrator'}</small></div></div><form action="/api/admin/logout" method="post"><button className="admin-signout">Sign out</button></form></div>
      </aside>

      <section className="admin-main">
        <header className="admin-header"><div><span className="admin-kicker">Control centre</span><h1>Dashboard</h1><p>Monitor client enquiries, manage follow-ups and control administrator access.</p></div><div className="admin-header-status"><span className="admin-live-dot"></span>System active</div></header>

        {canSeeInsights && <>
        <section className="admin-insight-hero" id="dashboard">
          <div><span className="admin-kicker">Business development</span><h2>Enquiry pipeline</h2><p>Keep every client conversation visible from first contact through completion.</p></div>
          <div className="admin-hero-metric"><span>Total enquiries</span><strong>{stats.total}</strong><small>Recorded enquiries</small></div>
        </section>

        <section className="admin-stat-grid">
          <div className="admin-stat-card accent-gold"><span>Total enquiries</span><strong>{stats.total}</strong><small>All recorded enquiries</small></div>
          <div className="admin-stat-card"><span>New</span><strong>{stats.new}</strong><small>Awaiting first response</small></div>
          <div className="admin-stat-card"><span>Contacted</span><strong>{stats.contacted}</strong><small>Initial contact made</small></div>
          <div className="admin-stat-card"><span>Qualified</span><strong>{stats.qualified}</strong><small>Active opportunities</small></div>
          <div className="admin-stat-card"><span>Closed</span><strong>{stats.closed}</strong><small>Completed or closed</small></div>
        </section>

        <section className="admin-insights-grid">
          <div className="admin-panel">
            <div className="admin-panel-head"><div><span className="admin-kicker">Client journey</span><h3>Enquiry progress</h3></div><span className="admin-panel-note">{stats.total ? `${Math.round((stats.closed / stats.total) * 100)}% closed` : 'No activity yet'}</span></div>
            <div className="pipeline-list">{pipeline.map(item => <div className="pipeline-row" key={item.key}><div className="pipeline-label"><span className={`pipeline-dot ${item.tone}`}></span><span>{item.label}</span><strong>{item.count}</strong></div><div className="pipeline-track"><span className={`pipeline-fill ${item.tone}`} style={{ width: `${stats.total ? Math.max(item.count / stats.total * 100, item.count ? 4 : 0) : 0}%` }}></span></div></div>)}</div>
          </div>
          <div className="admin-panel">
            <div className="admin-panel-head"><div><span className="admin-kicker">Demand insight</span><h3>Services requested</h3></div><Spark /></div>
            <div className="service-insight-list">{serviceCounts.length ? serviceCounts.map(([name,count]) => <div className="service-insight-row" key={name}><div><strong>{name}</strong><span>{count} {count === 1 ? 'enquiry' : 'enquiries'}</span></div><div className="service-mini-track"><span style={{ width: `${serviceCounts[0]?.[1] ? (count / serviceCounts[0][1]) * 100 : 0}%` }}></span></div></div>) : <p className="admin-muted">Service demand will appear here after enquiries arrive.</p>}</div>
          </div>
        </section>

        </>}

        <section className="admin-panel" id="inquiries"><div className="admin-panel-head"><div><span className="admin-kicker">Client management</span><h3>Inquiries</h3><p>Search, filter and move each enquiry through the client progress stages.</p></div><span className="admin-panel-note">{recent.length ? `${recent.length} most recent shown below` : 'No enquiries yet'}</span></div><AdminTable submissions={enquiries} /></section>

        {isOwner(user.email) && <AdminAccess currentEmail={user.email || ''} canManage={true} />}
      </section>
    </div>
  </main>;
}
