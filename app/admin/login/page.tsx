'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Incorrect email or password.');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className=" flex-1 flex items-center justify-center bg-[var(--header)] py-16">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-[var(--text)] mb-1">Admin Login</h1>
        <p className="text-sm text-[var(--input-border)] mb-6">Beacon Street Gardens</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]"
              placeholder="Password"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--rust)]">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-2.5 rounded-md font-medium transition-colors ${
              loading
                ? 'bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed'
                : 'bg-[var(--rust)] hover:bg-[#a0523f] text-white'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}