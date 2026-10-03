import { NextResponse } from 'next/server';
import { requireAdmin, isOwner } from '@/lib/admin';

type Role = 'owner' | 'admin' | 'manager';

function normalize(email: string) { return email.trim().toLowerCase(); }
function validEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validPassword(password: string) { return password.length >= 8 && password.length <= 128; }
function validRole(role: string): role is Role { return ['admin', 'manager'].includes(role); }

async function findAuthUserByEmail(db: NonNullable<Awaited<ReturnType<typeof requireAdmin>>['db']>, email: string) {
  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return { user: null, error };
  const user = data.users.find(item => item.email?.toLowerCase() === email.toLowerCase()) || null;
  return { user, error: null };
}

export async function GET() {
  const { user, db } = await requireAdmin();
  if (!user || !db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const envEmails = (process.env.ADMIN_EMAILS || '').split(',').map(normalize).filter(Boolean);
  const { data, error } = await db.from('admin_users').select('id,email,active,role,auth_user_id,created_at').order('created_at', { ascending: true });
  if (error && error.code === '42P01') return NextResponse.json({ admins: envEmails.map(email => ({ id: `env-${email}`, email, active: true, role: 'owner', source: 'environment' })) });
  if (error) return NextResponse.json({ error: 'Could not load admin access.' }, { status: 500 });
  const byEmail = new Map(envEmails.map(email => [email, { id: `env-${email}`, email, active: true, role: 'owner' as Role, source: 'environment' }]));
  for (const row of data || []) byEmail.set(row.email.toLowerCase(), { ...row, source: 'dashboard' });
  return NextResponse.json({ admins: Array.from(byEmail.values()) });
}

export async function POST(request: Request) {
  const { user, db } = await requireAdmin();
  if (!user || !db || !isOwner(user.email)) return NextResponse.json({ error: 'Only the primary administrator can manage administrator accounts.' }, { status: 403 });
  try {
    const body = await request.json();
    const email = normalize(String(body.email || ''));
    const password = String(body.password || '');
    const role = String(body.role || 'admin');
    if (!validEmail(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    if (!validPassword(password)) return NextResponse.json({ error: 'Password must be between 8 and 128 characters.' }, { status: 400 });
    if (!validRole(role)) return NextResponse.json({ error: 'Select a valid administrator role.' }, { status: 400 });
    if (email === user.email?.toLowerCase()) return NextResponse.json({ error: 'This account is already the primary administrator.' }, { status: 400 });

    const { data: existingAccess } = await db.from('admin_users').select('id,auth_user_id').eq('email', email).maybeSingle();
    const { user: existing } = await findAuthUserByEmail(db, email);
    if (existing) {
      const accessQuery = existingAccess
        ? db.from('admin_users').update({ active: true, role, auth_user_id: existing.id }).eq('id', existingAccess.id)
        : db.from('admin_users').insert({ email, active: true, role, auth_user_id: existing.id });
      const { error: accessError } = await accessQuery;
      if (accessError) return NextResponse.json({ error: 'Could not grant dashboard access.' }, { status: 500 });
      if (password) {
        const { error: passwordError } = await db.auth.admin.updateUserById(existing.id, { password });
        if (passwordError) return NextResponse.json({ error: 'Access was granted, but the password could not be updated.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, email, role, existing: true });
    }

    const { data: created, error: authError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, created_by: user.email },
    });
    if (authError || !created.user) return NextResponse.json({ error: authError?.message || 'Could not create the admin account.' }, { status: 500 });

    const { error: dbError } = existingAccess
      ? await db.from('admin_users').update({ active: true, role, auth_user_id: created.user.id }).eq('id', existingAccess.id)
      : await db.from('admin_users').insert({ email, active: true, role, auth_user_id: created.user.id });
    if (dbError) {
      await db.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: dbError.code === '42P01' ? 'Run the latest Supabase schema first.' : 'Could not save the admin access record.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, email, role });
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  const { user, db } = await requireAdmin();
  if (!user || !db || !isOwner(user.email)) return NextResponse.json({ error: 'Only the primary administrator can manage administrator accounts.' }, { status: 403 });
  try {
    const body = await request.json();
    const id = String(body.id || '');
    const action = String(body.action || '');
    if (!id) return NextResponse.json({ error: 'Invalid administrator.' }, { status: 400 });
    const { data: target, error: targetError } = await db.from('admin_users').select('id,email,active,role,auth_user_id').eq('id', id).maybeSingle();
    if (targetError || !target) return NextResponse.json({ error: 'Administrator account not found.' }, { status: 404 });
    if (target.email.toLowerCase() === user.email?.toLowerCase()) return NextResponse.json({ error: 'Your primary administrator account cannot be changed here.' }, { status: 400 });

    if (action === 'toggle') {
      const active = Boolean(body.active);
      const { error } = await db.from('admin_users').update({ active }).eq('id', id);
      if (error) return NextResponse.json({ error: 'Could not update this administrator.' }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === 'role') {
      const role = String(body.role || 'admin');
      if (!validRole(role)) return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
      const { error } = await db.from('admin_users').update({ role }).eq('id', id);
      if (error) return NextResponse.json({ error: 'Could not update this role.' }, { status: 500 });
      if (target.auth_user_id) await db.auth.admin.updateUserById(target.auth_user_id, { user_metadata: { role } });
      return NextResponse.json({ ok: true });
    }

    if (action === 'reset-password') {
      const password = String(body.password || '');
      if (!validPassword(password)) return NextResponse.json({ error: 'Password must be between 8 and 128 characters.' }, { status: 400 });
      let authUserId = target.auth_user_id as string | null;
      if (!authUserId) {
        const found = await findAuthUserByEmail(db, target.email);
        authUserId = found.user?.id || null;
      }
      if (!authUserId) return NextResponse.json({ error: 'No authentication account was found for this administrator.' }, { status: 404 });
      const { error } = await db.auth.admin.updateUserById(authUserId, { password });
      if (error) return NextResponse.json({ error: 'Could not reset this password.' }, { status: 500 });
      if (!target.auth_user_id) await db.from('admin_users').update({ auth_user_id: authUserId }).eq('id', id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
}
