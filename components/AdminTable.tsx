'use client';
import { useMemo, useState } from 'react';
import type { ContactSubmission, SubmissionStatus } from '@/types';

const statuses: SubmissionStatus[] = ['new', 'contacted', 'qualified', 'closed'];

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '#';
  const international = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

export function AdminTable({ submissions }: { submissions: ContactSubmission[] }) {
  const [items, setItems] = useState(submissions);
  const [saving, setSaving] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | SubmissionStatus>('all');
  const [service, setService] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  const services = useMemo(() => Array.from(new Set(items.map(x => x.service || 'General enquiry'))).sort(), [items]);

  const filtered = useMemo(() => items.filter(x => {
    const haystack = `${x.name} ${x.email} ${x.phone || ''} ${x.company || ''} ${x.service || ''} ${x.message}`.toLowerCase();
    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchesStatus = status === 'all' || x.status === status;
    const matchesService = service === 'all' || (x.service || 'General enquiry') === service;
    const date = new Date(x.created_at);
    const matchesFrom = !from || date >= new Date(`${from}T00:00:00`);
    const matchesTo = !to || date <= new Date(`${to}T23:59:59`);
    return matchesSearch && matchesStatus && matchesService && matchesFrom && matchesTo;
  }), [items, search, status, service, from, to]);

  async function update(id: string, nextStatus: SubmissionStatus) {
    setSaving(id);
    try {
      const res = await fetch('/api/admin/submissions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: nextStatus }) });
      if (!res.ok) throw new Error();
      setItems(v => v.map(x => x.id === id ? { ...x, status: nextStatus } : x));
    } catch {
      alert('Could not update this enquiry.');
    } finally { setSaving(''); }
  }

  return <>
    <div className="admin-filters">
      <div className="admin-filter search-filter"><label>Search<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, company or message" /></label></div>
      <div className="admin-filter"><label>Status<select value={status} onChange={e => setStatus(e.target.value as 'all' | SubmissionStatus)}><option value="all">All statuses</option>{statuses.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select></label></div>
      <div className="admin-filter"><label>Service<select value={service} onChange={e => setService(e.target.value)}><option value="all">All services</option>{services.map(s => <option key={s} value={s}>{s}</option>)}</select></label></div>
      <div className="admin-filter"><label>From<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label></div>
      <div className="admin-filter"><label>To<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label></div>
      <button className="filter-clear" type="button" onClick={() => { setSearch(''); setStatus('all'); setService('all'); setFrom(''); setTo(''); }}>Clear</button>
    </div>

    {!items.length ? <div className="notice">No enquiries have been received yet.</div> : <>
      <div className="admin-result-line">Showing <strong>{filtered.length}</strong> of <strong>{items.length}</strong> enquiries</div>
      {!filtered.length ? <div className="notice">No enquiries match the selected filters.</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Received</th><th>Contact</th><th>Company</th><th>Service</th><th>Message</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map(x => <tr key={x.id}>
        <td><strong>{new Date(x.created_at).toLocaleDateString('en-KE')}</strong><br/><span className="table-muted">{new Date(x.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span></td>
        <td><strong>{x.name}</strong><br/><a href={`mailto:${x.email}`}>{x.email}</a>{x.phone && <><br/><a href={`tel:${x.phone}`}>{x.phone}</a></>}</td>
        <td>{x.company || '—'}</td>
        <td>{x.service || 'General enquiry'}</td>
        <td className="message-cell">{x.message}</td>
        <td><select className={`status-select status-${x.status}`} aria-label={`Status for ${x.name}`} value={x.status} disabled={saving === x.id} onChange={e => update(x.id, e.target.value as SubmissionStatus)}>{statuses.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select></td>
        <td><div className="table-actions"><button className="small-button" type="button" onClick={() => setSelected(x)}>View</button>{x.phone && <a className="small-button small-button-whatsapp" href={waLink(x.phone)} target="_blank" rel="noreferrer">WhatsApp</a>}<a className="small-button" href={`mailto:${x.email}`}>Email</a></div></td>
      </tr>)}</tbody></table></div>}
    </>}

    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-detail-title" onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">Enquiry details</span><h2 id="enquiry-detail-title">{selected.name}</h2></div><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button></div><div className="detail-grid"><div><span>Received</span><strong>{new Date(selected.created_at).toLocaleString('en-KE')}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Email</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div><div><span>Phone</span>{selected.phone ? <a href={`tel:${selected.phone}`}>{selected.phone}</a> : <strong>Not provided</strong>}</div><div><span>Company</span><strong>{selected.company || 'Not provided'}</strong></div><div><span>Service</span><strong>{selected.service || 'General enquiry'}</strong></div></div><div className="detail-message"><span>Message</span><p>{selected.message}</p></div><div className="modal-actions"><a className="button button-secondary" href={`mailto:${selected.email}`}>Email client</a>{selected.phone && <a className="button button-primary" href={waLink(selected.phone)} target="_blank" rel="noreferrer">WhatsApp client</a>}</div></div></div>}
  </>;
}
