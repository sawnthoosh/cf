'use client';

import { useState } from 'react';
import { supabase, checkSupabaseConfig } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety guard clause: blocks requests immediately if .env.local is missing/misplaced
    if (typeof checkSupabaseConfig === 'function' && !checkSupabaseConfig()) {
      return;
    }

    setError(null);
    setLoading(false);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        // Redirect directly to your functional control admin center
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-box">
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ fontFamily: 'var(--fh)', fontSize: '2rem', fontWeight: 900, color: 'var(--k)', textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
            <span style={{ color: 'var(--p)' }}>Claim</span>Fame
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '5px', fontWeight: 600 }}>
            Control Center Authentication
          </p>
        </div>

        {/* Credentials Form Handling Block */}
        <form onSubmit={handleLogin}>
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '20px', border: '1px solid #fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="fg" style={{ marginBottom: '20px' }}>
            <label className="flb" style={{ marginBottom: '8px' }}>Email Address</label>
            <input
              type="email"
              className="fi"
              placeholder="admin@letsclaimfame.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="fg" style={{ marginBottom: '30px' }}>
            <label className="flb" style={{ marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              className="fi"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="fsub" disabled={loading} style={{ margin: 0 }}>
            {loading ? 'Authenticating...' : 'Sign In To Dashboard →'}
          </button>
        </form>

      </div>
    </div>
  );
}