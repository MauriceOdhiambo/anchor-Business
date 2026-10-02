import Link from 'next/link';
import { ArrowUpRight } from './Icons';
import type { Service } from '@/lib/site';
export function ServiceCard({service}:{service:Service}){return <article className="service-card"><span className="service-number">{service.number}</span><h3>{service.title}</h3><p>{service.short}</p><Link className="service-link" href={`/services/${service.slug}`}>Explore service <ArrowUpRight/></Link></article>}
