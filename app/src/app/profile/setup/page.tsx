'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createWorker } from '@/lib/client-db';

const TRADES = [
  'Electrician', 'Plumber', 'Carpenter', 'Concreter', 'Steel Fixer',
  'Scaffolder', 'Painter', 'Tiler', 'Roofer', 'Bricklayer',
  'HVAC Technician', 'Telecommunications', 'General Labourer',
  'Site Supervisor', 'Safety Officer', 'Other',
];

export default function ProfileSetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', trade: '', years_experience: '', years_with_company: '', email: '', phone: '',
  });

  const handleSubmit = () => {
    const worker = createWorker({
      ...formData,
      years_experience: parseInt(formData.years_experience) || 0,
      years_with_company: parseInt(formData.years_with_company) || 0,
    });
    localStorage.setItem('coassure_worker_id', worker.id);
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white text-center">Set Up Your Profile</h1>
        <div className="flex gap-1 mt-3 max-w-xs mx-auto">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-sky-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Your name</label>
              <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white" placeholder="e.g. Dave Mitchell" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Your trade</label>
              <select value={formData.trade} onChange={e => setFormData(prev => ({ ...prev, trade: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white">
                <option value="">Select your trade...</option>
                {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={() => setStep(2)} disabled={!formData.name}
              className="w-full bg-sky-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-sky-700 disabled:opacity-50 mt-4">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 mb-2">This helps CoAssure adapt to your experience level. No judgement &mdash; it just means the conversation respects what you already know.</p>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Years in your trade</label>
              <input type="number" value={formData.years_experience} onChange={e => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white" placeholder="e.g. 12" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Years with current company</label>
              <input type="number" value={formData.years_with_company} onChange={e => setFormData(prev => ({ ...prev, years_with_company: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base bg-white dark:bg-zinc-800 dark:text-white" placeholder="e.g. 3" min="0" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-base font-medium">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-sky-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-sky-700">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 mb-2">Optional &mdash; for sending session summaries and reports.</p>
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
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(2)} className="flex-1 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-base font-medium">Back</button>
              <button onClick={handleSubmit} className="flex-1 bg-sky-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-sky-700">Done</button>
            </div>
            <button onClick={handleSubmit} className="w-full text-sm text-zinc-400 hover:text-zinc-600 mt-2">Skip &mdash; I&rsquo;ll add these later</button>
          </div>
        )}
      </div>
    </div>
  );
}
