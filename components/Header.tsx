import Link from 'next/link';
import { Logo } from './Logo';

export function Header(){return <header className="header"><div className="container nav"><Logo/><nav className="nav-links" aria-label="Primary navigation"><Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/industries">Industries</Link><Link href="/insights">Insights</Link><Link href="/contact" className="nav-cta">Talk to Anchor</Link></nav><div className="mobile-nav"><Link href="/services">Services</Link><Link href="/contact" className="nav-cta">Contact</Link></div></div></header>}
