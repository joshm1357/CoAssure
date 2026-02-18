'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VoiceRecorder from '@/components/VoiceRecorder';

const REPORT_TYPES = [
  { value: 'near-miss', label: 'Near Miss', description: 'Something almost happened', color: 'bg-amber-500' },
  { value: 'hazard', label: 'Hazard', description: 'Something that could cause harm', color: 'bg-red-500' },
  { value: 'good-catch', label: 'Good Catch', description: 'Someone caught a risk early', color: 'bg-emerald-500' },
  { value: 'observation', label: 'Observation', description: 'Something worth noting', color: 'bg-sky-500' },
];

const SEVERITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
];

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    report_type: '',
    severity: '',
    description: '',
    contributing_factors: '',
    actions_taken: '',
    is_anonymous: false,
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const workerId = localStorage.getItem('coassure_worker_id');
    if (!workerId) {
      router.push('/profile/setup');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { /* location not available */ },
      { timeout: 5000 }
    );
  }, [router]);

  const handleSubmit = async () => {
    const workerId = localStorage.getItem('coassure_worker_id');
    if (!workerId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: workerId,
          ...formData,
          location_lat: location?.lat,
          location_lng: location?.lng,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceDescription = (text: string) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description ? `${prev.description} ${text}` : text,
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Report Submitted</h2>
          <p className="text-sm text-zinc-500 mb-6">Thanks for reporting. Every report helps keep the site safer.</p>
          <Link
            href="/"
            className="bg-sky-600 text-white rounded-xl px-8 py-3 text-sm font-semibold hover:bg-sky-700 inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-sky-600 text-sm font-medium">&larr; Home</Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Report</h1>
          <div className="w-12" />
        </div>
        <div className="flex gap-1 mt-3 max-w-xs mx-auto">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-sky-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* Step 1: Type */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500 mb-2">What are you reporting?</p>
            {REPORT_TYPES.map(({ value, label, description, color }) => (
              <button
                key={value}
                onClick={() => {
                  setFormData(prev => ({ ...prev, report_type: value }));
                  setStep(2);
                }}
                className={`w-full flex items-center gap-4 bg-white dark:bg-zinc-900 border rounded-2xl px-5 py-5 text-left transition-colors
                  ${formData.report_type === value
                    ? 'border-sky-400 dark:border-sky-600'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                <div>
                  <p className="text-base font-semibold text-zinc-900 dark:text-white">{label}</p>
                  <p className="text-sm text-zinc-500">{description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Description + severity */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500 mb-3">Tell us what happened. Speak or type.</p>
              <VoiceRecorder onTranscript={handleVoiceDescription} />
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full mt-3 rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-sm bg-white dark:bg-zinc-800 dark:text-white min-h-[120px] resize-none"
                placeholder="Describe what happened..."
              />
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Severity</p>
              <div className="flex gap-2">
                {SEVERITIES.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => setFormData(prev => ({ ...prev, severity: value }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                      ${formData.severity === value
                        ? color
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                What contributed to this? (optional)
              </label>
              <input
                type="text"
                value={formData.contributing_factors}
                onChange={e => setFormData(prev => ({ ...prev, contributing_factors: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white"
                placeholder="e.g. poor lighting, time pressure, equipment issue"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-base font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.description.trim()}
                className="flex-1 bg-sky-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-sky-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Actions + anonymous + submit */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Any immediate action taken? (optional)
              </label>
              <input
                type="text"
                value={formData.actions_taken}
                onChange={e => setFormData(prev => ({ ...prev, actions_taken: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white"
                placeholder="e.g. area cordoned off, supervisor notified"
              />
            </div>

            <label className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={e => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                className="w-5 h-5 rounded border-zinc-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Submit anonymously</p>
                <p className="text-xs text-zinc-500">Your name won&rsquo;t be attached to this report</p>
              </div>
            </label>

            {/* Summary preview */}
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Preview</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                <span className="font-medium capitalize">{formData.report_type.replace('-', ' ')}</span>
                {formData.severity && <span className="text-zinc-500"> &middot; {formData.severity}</span>}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{formData.description}</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-base font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-sky-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-sky-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
