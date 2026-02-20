'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signInWithMagicLink, isLocalMode } from '@/lib/auth';
import { loadDemoData } from '@/lib/demo-data';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLocalMode()) {
      // In local mode, check for demo account or redirect to setup
      if (email === 'demo@coassure.com') {
        loadDemoData();
        router.push('/');
        return;
      }
      const workerId = localStorage.getItem('coassure_worker_id');
      if (workerId) {
        router.push('/');
      } else {
        router.push('/profile/setup');
      }
      setLoading(false);
      return;
    }

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLocalMode()) {
      setError('Magic links require Supabase. Use password login or demo mode.');
      setLoading(false);
      return;
    }

    const { error: authError } = await signInWithMagicLink(email);
    if (authError) {
      setError(authError);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  const handleDemoLogin = () => {
    loadDemoData();
    router.push('/');
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-sm text-zinc-500">We sent a login link to <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>. Click it to sign in.</p>
          <button onClick={() => setMagicLinkSent(false)} className="mt-6 text-sm text-sky-600 font-medium">Try a different email</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">CoAssure</h1>
          <p className="text-sm text-zinc-500">Voice-first safety co-pilot</p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-6">
          <button onClick={() => setMode('password')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'password' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
            Password
          </button>
          <button onClick={() => setMode('magic')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'magic' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
            Magic Link
          </button>
        </div>

        <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white"
              placeholder="dave@example.com" />
          </div>

          {mode === 'password' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white"
                placeholder="Your password" />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-sky-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-sky-700 disabled:opacity-50">
            {loading ? 'Signing in...' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-zinc-500">
            Don&rsquo;t have an account? <Link href="/signup" className="text-sky-600 font-medium">Sign up</Link>
          </p>
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <button onClick={handleDemoLogin}
              className="w-full border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800">
              Try Demo Account
            </button>
            <p className="text-[10px] text-zinc-400 mt-2">Pre-loaded with sessions, reports, and example data</p>
          </div>
        </div>

        {isLocalMode() && (
          <div className="mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Running in local mode — data stored in browser only. Configure Supabase environment variables for full auth.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
