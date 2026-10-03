import { getSupabaseAdmin } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { user: null, db: null };
  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  const email = user.email.toLowerCase();
  if (allowed.includes(email)) return { user, db: getSupabaseAdmin() };
  const db = getSupabaseAdmin();
  if (!db) return { user: null, db: null };
  const { data } = await db.from('admin_users').select('email').eq('email', email).eq('active', true).maybeSingle();
  if (!data) return { user: null, db: null };
  return { user, db };
}
