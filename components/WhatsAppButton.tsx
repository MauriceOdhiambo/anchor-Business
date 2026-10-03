import { site } from '@/lib/site';

export function WhatsAppButton() {
  return <a className="whatsapp-float" href={site.whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with Anchor Business Insights on WhatsApp"><span className="whatsapp-symbol">◔</span><span>WhatsApp us</span></a>;
}
