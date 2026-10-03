'use client';
import { useEffect, useState } from 'react';

type Admin = { id: string; email: string; active: boolean; source: string; created_at?: string };

export function AdminAccess({ currentEmail }: { currentEmail: string }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/admins', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) setAdmins(data.admins || []); else setMessage(data.error || 'Could not load admin access.');
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage('');
    const res = await fetch('/api/admin/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Could not add admin.'); else { setEmail(''); setMessage('Admin access added. Make sure this email also has a Supabase Auth account.'); await load(); }
    setSaving(false);
  }

  async function toggleAdmin(admin: Admin) {
    const next = !admin.active;
    const res = await fetch('/api/admin/admins', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: admin.id, active: next }) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Could not update admin.'); else setAdmins(v => v.map(x => x.id === admin.id ? { ...x, active: next } : x));
  }

  return <section className="admin-access-card"><div className="admin-section-head"><div><span className="eyebrow">Access control</span><h2>Admin accounts</h2><p>Add additional authorised email addresses for the dashboard. Each person must also have a Supabase Auth account.</p></div></div><form className="admin-add-form" onSubmit={addAdmin}><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="newadmin@company.com"/><button className="button button-primary" disabled={saving}>{saving ? 'Adding…' : 'Add admin'}</button></form>{message && <p className="admin-inline-message">{message}</p>}{loading ? <p className="table-muted">Loading admin accounts…</p> : <div className="admin-user-list">{admins.map(admin => <div className="admin-user-row" key={admin.id}><div><strong>{admin.email}</strong><span>{admin.source === 'environment' ? 'Environment allow-list' : 'Dashboard-managed account'}</span></div><div className="admin-user-actions"><span className={`admin-active ${admin.active ? 'is-active' : ''}`}>{admin.active ? 'Active' : 'Disabled'}</span>{admin.source !== 'environment' && admin.email !== currentEmail.toLowerCase() && <button className="small-button" type="button" onClick={() => toggleAdmin(admin)}>{admin.active ? 'Disable' : 'Enable'}</button>}</div></div>)}</div>}</section>;
}
