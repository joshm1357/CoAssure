'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SafetyScore from '@/components/SafetyScore';
import TrainingList from '@/components/TrainingList';

interface WorkerProfile {
  id: string;
  name: string;
  trade: string | null;
  years_experience: number;
  years_with_company: number;
  email: string | null;
  phone: string | null;
  safety_score: number;
  interaction_level: 'peer' | 'standard' | 'supportive';
  training_records: {
    id: string;
    cert_type: string;
    cert_name: string;
    issued_date: string | null;
    expiry_date: string | null;
    issuer: string | null;
    status: 'current' | 'expiring' | 'expired';
  }[];
  total_sessions: number;
  total_reports: number;
  recent_session_count: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const workerId = localStorage.getItem('coassure_worker_id');
    if (!workerId) {
      router.push('/profile/setup');
      return;
    }

    try {
      const res = await fetch(`/api/worker/${workerId}`);
      if (res.ok) {
        setProfile(await res.json());
      } else {
        router.push('/profile/setup');
      }
    } catch {
      // fetch failed
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-sky-600 text-sm font-medium">&larr; Home</Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Your Profile</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{profile.name}</h2>
              <p className="text-sm text-zinc-500 mt-0.5">{profile.trade || 'Trade not set'}</p>
              <div className="flex gap-4 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                <span>{profile.years_experience} yrs experience</span>
                <span>{profile.years_with_company} yrs with company</span>
              </div>
            </div>
            <SafetyScore score={profile.safety_score} level={profile.interaction_level} />
          </div>

          {/* What the score means */}
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">
              {profile.interaction_level === 'peer' && (
                <>Your experience is recognised. CoAssure will keep prompts brief and focus on what&rsquo;s specific to the job today.</>
              )}
              {profile.interaction_level === 'standard' && (
                <>CoAssure adapts to your experience. You&rsquo;ll get focused safety prompts tailored to each job.</>
              )}
              {profile.interaction_level === 'supportive' && (
                <>CoAssure provides extra context as you build your experience. The more you use it, the more it adapts.</>
              )}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-center">
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{profile.total_sessions}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Sessions</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-center">
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{profile.total_reports}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Reports</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-center">
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{profile.training_records.filter(t => t.status === 'current').length}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Current Certs</p>
          </div>
        </div>

        {/* Training records */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <TrainingList
            records={profile.training_records}
            workerId={profile.id}
            onUpdate={fetchProfile}
          />
        </div>

        {/* Contact */}
        {(profile.email || profile.phone) && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Contact</h3>
            {profile.email && <p className="text-sm text-zinc-600 dark:text-zinc-400">{profile.email}</p>}
            {profile.phone && <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{profile.phone}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
