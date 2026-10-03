import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

function normalize(email: string) { return email.trim().toLowerCase(); }
function validEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

export async function GET() {
  const { user, db } = await requireAdmin();
  if (!user || !db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const envEmails = (process.env.ADMIN_EMAILS || '').split(',').map(normalize).filter(Boolean);
  const { data, error } = await db.from('admin_users').select('id,email,active,created_at').order('created_at', { ascending: true });
  if (error && error.code === '42P01') return NextResponse.json({ admins: envEmails.map(email => ({ id: `env-${email}`, email, active: true, source: 'environment' })) });
  if (error) return NextResponse.json({ error: 'Could not load admin access.' }, { status: 500 });
  const byEmail = new Map(envEmails.map(email => [email, { id: `env-${email}`, email, active: true, source: 'environment' }]));
  for (const row of data || []) byEmail.set(row.email.toLowerCase(), { ...row, source: 'dashboard' });
  return NextResponse.json({ admins: Array.from(byEmail.values()) });
}

export async function POST(request: Request) {
  const { user, db } = await requireAdmin();
  if (!user || !db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const email = normalize(String(body.email || ''));
    if (!validEmail(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    if (email === user.email?.toLowerCase()) return NextResponse.json({ error: 'This admin account is already active.' }, { status: 400 });
    const { error } = await db.from('admin_users').upsert({ email, active: true }, { onConflict: 'email' });
    if (error) return NextResponse.json({ error: error.code === '42P01' ? 'Run the latest Supabase schema first to enable dashboard-managed admins.' : 'Could not add this admin.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  const { user, db } = await requireAdmin();
  if (!user || !db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const id = String(body.id || '');
    const active = Boolean(body.active);
    if (!id) return NextResponse.json({ error: 'Invalid admin.' }, { status: 400 });
    const { data: target } = await db.from('admin_users').select('email').eq('id', id).maybeSingle();
    if (target?.email?.toLowerCase() === user.email?.toLowerCase() && !active) return NextResponse.json({ error: 'You cannot disable your own admin access.' }, { status: 400 });
    const { error } = await db.from('admin_users').update({ active }).eq('id', id);
    if (error) return NextResponse.json({ error: 'Could not update this admin.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
}
