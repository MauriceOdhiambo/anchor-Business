import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendAdminAlert(payload: { name: string; email: string; phone: string; company: string; service: string; message: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return;

  const recipients = new Set((process.env.ADMIN_EMAILS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean));
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase.from('admin_users').select('email').eq('active', true);
    for (const row of data || []) if (row.email) recipients.add(row.email.toLowerCase());
  }
  if (!recipients.size) return;

  const html = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#10253a"><div style="background:#063b68;color:#fff;padding:24px;border-radius:14px 14px 0 0"><h2 style="margin:0">New website enquiry</h2><p style="margin:6px 0 0;color:#d7e4ed">Anchor Business Insights Consulting</p></div><div style="padding:24px;border:1px solid #dfe7ee;border-top:0;border-radius:0 0 14px 14px"><p><strong>Name:</strong> ${escapeHtml(payload.name)}</p><p><strong>Email:</strong> ${escapeHtml(payload.email)}</p><p><strong>Phone:</strong> ${escapeHtml(payload.phone || 'Not provided')}</p><p><strong>Company:</strong> ${escapeHtml(payload.company || 'Not provided')}</p><p><strong>Service:</strong> ${escapeHtml(payload.service || 'General enquiry')}</p><hr style="border:0;border-top:1px solid #dfe7ee"><p><strong>Message</strong></p><p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p><p style="margin-top:24px"><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin" style="display:inline-block;background:#e9b52f;color:#17334b;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Open admin dashboard</a></p></div></div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: Array.from(recipients), subject: `New enquiry from ${payload.name}`, html }),
  }).catch(error => console.error('admin alert email error', error));
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (String(body.website || '').trim()) return NextResponse.json({ ok: true });
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const company = String(body.company || '').trim();
    const service = String(body.service || '').trim();
    const message = String(body.message || '').trim();
    if (!name || !email || !message) return NextResponse.json({ error: 'Please provide your name, email and message.' }, { status: 400 });
    if (!emailPattern.test(email)) return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    if (name.length > 120 || email.length > 160 || phone.length > 40 || company.length > 160 || service.length > 180 || message.length > 5000) return NextResponse.json({ error: 'One or more fields are too long.' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'The enquiry system is not configured yet. Please contact us by phone or email.' }, { status: 503 });
    const { error } = await supabase.from('contact_submissions').insert({ name, email, phone: phone || null, company: company || null, service: service || null, message });
    if (error) { console.error('contact submission error', error); return NextResponse.json({ error: 'We could not submit your enquiry. Please try again.' }, { status: 500 }); }
    await sendAdminAlert({ name, email, phone, company, service, message });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
}
