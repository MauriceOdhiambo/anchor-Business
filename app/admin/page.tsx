import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { AdminTable } from '@/components/AdminTable';

export const dynamic='force-dynamic';

export default async function Admin(){const {user,db}=await requireAdmin();if(!user)redirect('/admin/login');if(!db) return <main className="admin-shell"><div className="container"><div className="notice">Supabase server configuration is incomplete. Add the service-role key to Vercel.</div></div></main>;const {data,error}=await db.from('contact_submissions').select('*').order('created_at',{ascending:false}).limit(200);if(error)return <main className="admin-shell"><div className="container"><div className="notice">Could not load enquiries. Check the Supabase table and server credentials.</div></div></main>;return <main className="admin-shell"><div className="container"><div className="admin-top"><div><span className="eyebrow">Private dashboard</span><h1 style={{margin:'8px 0 0',fontSize:'2.2rem'}}>Enquiries</h1><p style={{color:'var(--muted)',margin:0}}>Signed in as {user.email}</p></div><form action="/api/admin/logout" method="post"><button className="button button-secondary">Sign out</button></form></div><AdminTable submissions={data||[]}/></div></main>}
