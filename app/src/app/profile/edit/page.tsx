'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWorker, updateWorker } from '@/lib/client-db';
import type { Worker } from '@/lib/types';

const TRADES = [
  'Electrician', 'Plumber', 'Carpenter', 'Concreter', 'Steel Fixer',
  'Scaffolder', 'Painter', 'Tiler', 'Roofer', 'Bricklayer',
  'HVAC Technician', 'Telecommunications', 'General Labourer',
  'Site Supervisor', 'Safety Officer', 'Other',
];

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', trade: '', years_experience: '', years_with_company: '', email: '', phone: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const workerId = localStorage.getItem('coassure_worker_id');
    if (!workerId) { router.push('/profile/setup'); return; }
    const worker = getWorker(workerId);
    if (!worker) { router.push('/profile/setup'); return; }
    setFormData({
      name: worker.name,
      trade: worker.trade || '',
      years_experience: String(worker.years_experience),
      years_with_company: String(worker.years_with_company),
      email: worker.email || '',
      phone: worker.phone || '',
    });
  }, [router]);

  const handleSave = () => {
    const workerId = localStorage.getItem('coassure_worker_id');
    if (!workerId) return;
    updateWorker(workerId, {
      name: formData.name,
      trade: formData.trade || null,
      years_experience: parseInt(formData.years_experience) || 0,
      years_with_company: parseInt(formData.years_with_company) || 0,
      email: formData.email || null,
      phone: formData.phone || null,
    });
    setSaved(true);
    setTimeout(() => router.push('/profile'), 800);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/profile" className="text-sky-600 text-sm font-medium">&larr; Profile</Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Edit Profile</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Trade</label>
            <select value={formData.trade} onChange={e => setFormData(prev => ({ ...prev, trade: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white">
              <option value="">Select your trade...</option>
              {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Years in trade</label>
              <input type="number" value={formData.years_experience} onChange={e => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Years with company</label>
              <input type="number" value={formData.years_with_company} onChange={e => setFormData(prev => ({ ...prev, years_with_company: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white" min="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white" placeholder="dave@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Phone</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white" placeholder="0412 345 678" />
          </div>
        </div>

        <p className="text-xs text-zinc-400 text-center">
          Changing your experience updates your safety score and how CoAssure adapts conversations.
        </p>

        <button onClick={handleSave} disabled={!formData.name.trim()}
          className="w-full bg-sky-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-sky-700 disabled:opacity-50">
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
