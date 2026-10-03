'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';

export default function AdminLogin(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault();
    setLoading(true);
    setError('');
    try{
      const supabase=getSupabaseBrowser();
      const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
      if(error) throw error;
      window.location.assign('/admin');
    }catch(err){
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
      setLoading(false);
    }
  }

  return <main className="admin-login-page">
    <section className="admin-login-card" aria-label="Administrator sign in">
      <div className="admin-login-brand-panel">
        <div className="admin-login-logo-wrap"><Image src="/anchor-logo.png" alt="Anchor Business Insights Consulting" width={430} height={145} priority /></div>
        <div className="admin-login-brand-copy"><span>Business administration</span><strong>Control centre</strong></div>
      </div>
      <div className="admin-login-form-panel">
        <div className="admin-login-heading">
          <span className="admin-kicker">Administrator</span>
          <h1>Sign in</h1>
        </div>
        <form onSubmit={submit}>
          <label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" /></label>
          <label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" /></label>
          <button className="admin-login-submit" disabled={loading}>{loading?'Signing in…':'Sign in'}</button>
          {error && <p className="admin-login-error" role="alert">{error}</p>}
        </form>
        <a className="admin-login-back" href="/">Return to website</a>
      </div>
    </section>
  </main>;
}
