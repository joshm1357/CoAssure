'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, isLocalMode } from '@/lib/auth';
import type { AccountType } from '@/lib/auth';

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string }[] = [
  { value: 'personal', label: 'Personal', description: 'Individual worker — track your own safety sessions and reports' },
  { value: 'contractor', label: 'Contractor', description: 'Contractor company — manage your team across multiple sites' },
  { value: 'organisation', label: 'Organisation', description: 'Builder / Principal — manage sites, contractors, and templates' },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    account_type: 'personal' as AccountType,
    org_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLocalMode()) {
      // In local mode, skip Supabase and go straight to profile setup
      router.push('/profile/setup');
      return;
    }

    const { error: authError } = await signUp(formData.email, formData.password, formData.name);
    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-sm text-zinc-500">We sent a confirmation link to <span className="font-medium text-zinc-700 dark:text-zinc-300">{formData.email}</span>. Click it to activate your account.</p>
          <Link href="/login" className="mt-6 text-sm text-sky-600 font-medium inline-block">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">Join CoAssure</h1>
          <p className="text-sm text-zinc-500">Set up your safety co-pilot</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6 max-w-xs mx-auto">
          {[1, 2].map(s => <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-sky-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />)}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">How will you use CoAssure?</p>
            {ACCOUNT_TYPES.map(({ value, label, description }) => (
              <button key={value} onClick={() => { setFormData(prev => ({ ...prev, account_type: value })); setStep(2); }}
                className={`w-full text-left bg-white dark:bg-zinc-900 border rounded-2xl px-5 py-4 transition-colors ${formData.account_type === value ? 'border-sky-400' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}>
                <p className="text-base font-semibold text-zinc-900 dark:text-white">{label}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Your name</label>
              <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white"
                placeholder="Dave Mitchell" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} required
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white"
                placeholder="dave@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
              <input type="password" value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} required minLength={8}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white"
                placeholder="At least 8 characters" />
            </div>

            {(formData.account_type === 'contractor' || formData.account_type === 'organisation') && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {formData.account_type === 'contractor' ? 'Company name' : 'Organisation name'}
                </label>
                <input type="text" value={formData.org_name} onChange={e => setFormData(prev => ({ ...prev, org_name: e.target.value }))} required
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white"
                  placeholder="e.g. Mitchell Electrical Pty Ltd" />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-base font-medium">Back</button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-sky-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-sky-700 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="text-sm text-zinc-500 text-center mt-6">
          Already have an account? <Link href="/login" className="text-sky-600 font-medium">Sign in</Link>
        </p>

        {isLocalMode() && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Running in local mode. Signup will redirect to profile setup without creating a cloud account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
