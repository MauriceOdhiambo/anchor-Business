import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { site } from '@/lib/site';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.shortName}` },
  description: site.description,
  applicationName: site.shortName,
  keywords: ['business consulting Eldoret','business advisory Kenya','business consultant Eldoret','SME consulting Kenya','bookkeeping Eldoret','tax filing Eldoret','credit management Kenya','internal control audit Kenya','company compliance Eldoret'],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'en_KE', url: site.url, siteName: site.name, title: site.name, description: site.description, images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Anchor Business Insights Consulting' }] },
  twitter: { card: 'summary_large_image', title: site.name, description: site.description, images: ['/og-image.jpg'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phone,
  email: site.email,
  address: { '@type': 'PostalAddress', streetAddress: '1st Floor, Tilil House, Kenyatta Street', addressLocality: 'Eldoret', addressRegion: 'Uasin Gishu County', addressCountry: 'KE' },
  areaServed: [{ '@type': 'City', name: 'Eldoret' }, { '@type': 'Country', name: 'Kenya' }],
  serviceType: 'Business consulting',
};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-KE"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><Header/>{children}<WhatsAppButton/><Footer/></body></html>}
