'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-box">
        <div className="nlogo" style={{justifyContent: 'center', marginBottom: '10px'}}>
          <span className="nlogo-claim">Claim</span><span className="nlogo-fame">Fame</span>
        </div>
        <p style={{textAlign: 'center', color: 'var(--muted)', marginBottom: '30px', fontSize: '0.9rem'}}>Secure Agency Access</p>

        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div className="fg">
            <label className="flb">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="fi" required />
          </div>
          <div className="fg">
            <label className="flb">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="fi" required />
          </div>
          
          {error && <p style={{color: 'red', fontSize: '0.85rem', textAlign: 'center'}}>{error}</p>}
          
          <button type="submit" disabled={loading} className="fsub" style={{marginTop: '10px'}}>
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}