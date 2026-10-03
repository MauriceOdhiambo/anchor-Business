'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';
import { Chart, Shield } from '@/components/Icons';

export function AdminShell({children,email,role,owner}:{children:ReactNode;email:string;role:string;owner:boolean}){
  const pathname=usePathname();
  const active=(path:string)=>pathname===path||pathname.startsWith(`${path}/`);

  async function signOut(){
    try { await getSupabaseBrowser().auth.signOut(); } finally {
      try { await fetch('/api/admin/logout',{method:'POST',credentials:'include'}); } finally { window.location.assign('/admin/login'); }
    }
  }

  return <main className="admin-shell">
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand-logo"><Image src="/anchor-logo.png" alt="Anchor Business Insights Consulting" width={270} height={92} priority /></div>
        <nav className="admin-nav" aria-label="Admin menu">
          <Link className={active('/admin')&&!active('/admin/inquiries')&&!active('/admin/access')?'active':''} href="/admin"><span><Chart/></span>Dashboard</Link>
          <Link className={active('/admin/inquiries')?'active':''} href="/admin/inquiries"><span className="admin-nav-glyph">▤</span>Inquiries</Link>
          {owner&&<Link className={active('/admin/access')?'active':''} href="/admin/access"><span><Shield/></span>Access control</Link>}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-mini"><span>{email.slice(0,1).toUpperCase()}</span><div><strong>{email}</strong><small>{owner?'Owner':role==='manager'?'Manager':'Administrator'}</small></div></div>
          <button type="button" className="admin-signout" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <section className="admin-main">{children}</section>
    </div>
  </main>;
}
