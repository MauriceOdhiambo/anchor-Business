import Image from 'next/image';
import Link from 'next/link';

export function Logo(){
  return <Link href="/" className="brand" aria-label="Anchor Business Insights Consulting home">
    <Image src="/anchor-logo.png" alt="Anchor Business Insights Consulting" width={330} height={112} priority className="site-logo" />
  </Link>;
}
