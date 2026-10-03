'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Chart, Shield, Spark } from '@/components/Icons';

export function AdminShell({
  children,
  email,
  role,
  owner,
}: {
  children: ReactNode;
  email: string;
  role: string;
  owner: boolean;
}) {
  const pathname = usePathname();
  const active = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <main className="admin-shell">
      <div className="admin-app">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span className="admin-brand-mark">A</span>
            <div><strong>Anchor</strong><span>Business Insights</span></div>
          </div>
          <div className="admin-sidebar-label">Administration</div>
          <nav className="admin-nav" aria-label="Admin menu">
            <Link className={active('/admin') && !active('/admin/inquiries') && !active('/admin/access') ? 'active' : ''} href="/admin">
              <span><Chart /></span>Dashboard
            </Link>
            <Link className={active('/admin/inquiries') ? 'active' : ''} href="/admin/inquiries">
              <span className="admin-nav-glyph">▤</span>Inquiries
            </Link>
            {owner && <Link className={active('/admin/access') ? 'active' : ''} href="/admin/access">
              <span><Shield /></span>Access control
            </Link>}
          </nav>
          <div className="admin-sidebar-footer">
            <div className="admin-user-mini">
              <span>{email.slice(0, 1).toUpperCase()}</span>
              <div><strong>{email}</strong><small>{owner ? 'Primary owner' : role === 'manager' ? 'Manager' : 'Administrator'}</small></div>
            </div>
            <form action="/api/admin/logout" method="post"><button className="admin-signout">Sign out</button></form>
          </div>
        </aside>
        <section className="admin-main">
          <div className="admin-topbar">
            <div className="admin-topbar-label"><Spark /> Secure administration</div>
            <span className="admin-live-dot"></span><span className="admin-system-text">System active</span>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
