import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import type { SubmissionStatus } from '@/types';
const allowed:SubmissionStatus[]=['new','contacted','qualified','closed'];
export async function PATCH(request:Request){const {user,db}=await requireAdmin();if(!user||!db)return NextResponse.json({error:'Unauthorized'},{status:401});try{const body=await request.json();const id=String(body.id||'');const status=String(body.status||'') as SubmissionStatus;if(!id||!allowed.includes(status))return NextResponse.json({error:'Invalid request'},{status:400});const {error}=await db.from('contact_submissions').update({status}).eq('id',id);if(error)return NextResponse.json({error:'Update failed'},{status:500});return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Invalid request'},{status:400})}}
