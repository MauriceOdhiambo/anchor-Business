import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request){
  try{
    const body=await request.json();
    if(String(body.website||'').trim()) return NextResponse.json({ok:true});
    const name=String(body.name||'').trim();
    const email=String(body.email||'').trim().toLowerCase();
    const phone=String(body.phone||'').trim();
    const company=String(body.company||'').trim();
    const service=String(body.service||'').trim();
    const message=String(body.message||'').trim();
    if(!name||!email||!message)return NextResponse.json({error:'Please provide your name, email and message.'},{status:400});
    if(!emailPattern.test(email))return NextResponse.json({error:'Please provide a valid email address.'},{status:400});
    if(name.length>120||email.length>160||phone.length>40||company.length>160||service.length>180||message.length>5000)return NextResponse.json({error:'One or more fields are too long.'},{status:400});
    const supabase=getSupabaseAdmin();
    if(!supabase)return NextResponse.json({error:'The enquiry system is not configured yet. Please contact us by phone or email.'},{status:503});
    const {error}=await supabase.from('contact_submissions').insert({name,email,phone:phone||null,company:company||null,service:service||null,message});
    if(error){console.error('contact submission error',error);return NextResponse.json({error:'We could not submit your enquiry. Please try again.'},{status:500});}
    return NextResponse.json({ok:true});
  }catch{ return NextResponse.json({error:'Invalid request.'},{status:400}); }
}
