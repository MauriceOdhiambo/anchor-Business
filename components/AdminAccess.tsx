'use client';
import { useEffect, useState } from 'react';

type Role = 'admin' | 'manager';
type Admin = { id: string; email: string; active: boolean; role: 'owner' | Role; source: string; created_at?: string };

export function AdminAccess({ currentEmail, canManage = false }: { currentEmail: string; canManage?: boolean }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [resetFor, setResetFor] = useState<Admin | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/admins', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) setAdmins(data.admins || []); else setMessage(data.error || 'Could not load administrator access.');
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage('');
    const res = await fetch('/api/admin/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role }) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Could not add administrator.');
    else { setEmail(''); setPassword(''); setRole('admin'); setMessage(data.existing ? 'Existing account granted dashboard access.' : 'Administrator account created. Give the person the password securely.'); await load(); }
    setSaving(false);
  }

  async function toggleAdmin(admin: Admin) {
    const next = !admin.active;
    const res = await fetch('/api/admin/admins', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: admin.id, action: 'toggle', active: next }) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Could not update administrator.'); else { setAdmins(v => v.map(x => x.id === admin.id ? { ...x, active: next } : x)); setMessage(next ? 'Dashboard access restored.' : 'Dashboard access disabled.'); }
  }

  async function changeRole(admin: Admin, nextRole: Role) {
    const res = await fetch('/api/admin/admins', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: admin.id, action: 'role', role: nextRole }) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Could not update role.'); else { setAdmins(v => v.map(x => x.id === admin.id ? { ...x, role: nextRole } : x)); setMessage('Administrator role updated.'); }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault(); if (!resetFor) return;
    setSaving(true); setMessage('');
    const res = await fetch('/api/admin/admins', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: resetFor.id, action: 'reset-password', password: resetPassword }) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Could not reset password.'); else { setMessage(`Password reset for ${resetFor.email}. Share the new password securely.`); setResetFor(null); setResetPassword(''); }
    setSaving(false);
  }

  return <section className="admin-panel admin-access-panel" id="access">
    <div className="admin-section-head"><div><span className="admin-kicker">Access control</span><h2>Administrator access</h2><p>The primary administrator can create accounts, assign roles, reset passwords and suspend dashboard access without opening Supabase.</p></div><span className="admin-lock-badge">Owner controlled</span></div>
    {canManage ? <form className="admin-create-form" onSubmit={addAdmin}>
      <div><label>Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" /></label></div>
      <div><label>Initial password<input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" /></label></div>
      <div><label>Role<select value={role} onChange={e => setRole(e.target.value as Role)}><option value="admin">Administrator</option><option value="manager">Manager</option></select></label></div>
      <button className="admin-primary-button" disabled={saving}>{saving ? 'Creating…' : 'Create administrator'}</button>
    </form> : <div className="admin-permission-note">Only the primary administrator can change access, roles or passwords.</div>}
    {message && <p className="admin-inline-message">{message}</p>}
    <div className="admin-user-list">
      {loading ? <p className="admin-muted">Loading administrator accounts…</p> : admins.map(admin => <div className="admin-user-row admin-user-row-pro" key={admin.id}>
        <div className="admin-user-identity"><span className="admin-avatar">{admin.email.slice(0,1).toUpperCase()}</span><div><strong>{admin.email}</strong><span>{admin.source === 'environment' ? 'Primary administrator' : 'Dashboard-managed account'}</span></div></div>
        <div className="admin-user-actions-pro">
          <span className={`admin-status-pill ${admin.active ? 'is-active' : 'is-disabled'}`}>{admin.active ? 'Active' : 'Suspended'}</span>
          {admin.role === 'owner' ? <span className="admin-role-pill">Owner</span> : <select className="admin-role-select" value={admin.role} disabled={!canManage} onChange={e => changeRole(admin, e.target.value as Role)}><option value="admin">Administrator</option><option value="manager">Manager</option></select>}
          {canManage && admin.source !== 'environment' && admin.email !== currentEmail.toLowerCase() && <><button className="admin-text-button" type="button" onClick={() => setResetFor(admin)}>Reset password</button><button className="admin-text-button danger" type="button" onClick={() => toggleAdmin(admin)}>{admin.active ? 'Suspend' : 'Restore'}</button></>}
        </div>
      </div>)}
    </div>
    {resetFor && <div className="modal-backdrop" onClick={() => setResetFor(null)}><form className="admin-modal admin-dark-modal" onSubmit={resetPassword} onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="admin-kicker">Security</span><h2>Reset password</h2><p>Set a new password for <strong>{resetFor.email}</strong>. The password is not stored in this dashboard.</p></div><button type="button" className="modal-close" onClick={() => setResetFor(null)}>×</button></div><label>New password<input type="password" required minLength={8} value={resetPassword} onChange={e => setResetPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" /></label><div className="modal-actions"><button type="button" className="admin-secondary-button" onClick={() => setResetFor(null)}>Cancel</button><button className="admin-primary-button" disabled={saving}>{saving ? 'Resetting…' : 'Set new password'}</button></div></form></div>}
  </section>;
}
