import { getSupabaseAdmin } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export function isOwner(email?: string | null) {
  if (!email) return false;
  const owners = (process.env.ADMIN_EMAILS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  return owners.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { user: null, db: null };
  const email = user.email.toLowerCase();
  const db = getSupabaseAdmin();
  if (!db) return { user: null, db: null };
  if (isOwner(email)) return { user, db };
  const { data } = await db.from('admin_users').select('email,role').eq('email', email).eq('active', true).maybeSingle();
  if (!data) return { user: null, db: null };
  return { user, db, role: data.role || 'admin' };
}
