'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SafetyScore from '@/components/SafetyScore';
import { getWorkerProfile, getSessions } from '@/lib/client-db';
import { WorkerProfile, Session } from '@/lib/types';

const SESSION_TYPES = [
  {
    type: 'pre-start',
    label: 'Pre-Start',
    description: 'Talk through hazards for the job ahead',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    type: 'toolbox-talk',
    label: 'Toolbox Talk',
    description: 'Facilitate a team safety discussion',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    type: 'form-assist',
    label: 'Form Assistant',
    description: 'Fill out JSA, SWMS, Take 5 by talking',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    type: 'report',
    label: 'Quick Report',
    description: 'Near-miss, hazard, or good catch in 30 seconds',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  },
  {
    type: 'reflection',
    label: 'Reflection',
    description: 'End-of-day: what should the next person know?',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
];

const TYPE_LABELS: Record<string, string> = {
  'pre-start': 'Pre-Start',
  'toolbox-talk': 'Toolbox Talk',
  'form-assist': 'Form Assistant',
  'report': 'Report',
  'reflection': 'Reflection',
};

export default function Home() {
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('coassure_worker_id');
    if (stored) {
      const profile = getWorkerProfile(stored);
      if (profile) {
        setWorker(profile);
        const sessions = getSessions(stored);
        setRecentSessions(sessions.filter(s => s.status === 'completed').slice(0, 3));
      } else {
        localStorage.removeItem('coassure_worker_id');
      }
    }
    setLoading(false);
  }, []);

  const expiringCerts = worker?.training_records.filter(t => t.status === 'expiring') || [];
  const expiredCerts = worker?.training_records.filter(t => t.status === 'expired') || [];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">CoAssure</h1>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">Your safety co-pilot. Talk through hazards, fill out forms, and file reports &mdash; by voice.</p>
        </div>
        <Link
          href="/profile/setup"
          className="w-full max-w-sm bg-sky-600 text-white rounded-2xl py-4 text-center font-semibold text-lg hover:bg-sky-700 transition-colors block"
        >
          Get Started
        </Link>
        <p className="text-xs text-zinc-400 mt-4 text-center max-w-xs">
          Set up your profile in 2 minutes. Your experience shapes how CoAssure talks to you.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">CoAssure</h1>
            <p className="text-xs text-zinc-500">G&rsquo;day, {worker.name.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/settings" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <Link href="/profile" className="flex items-center gap-2">
              <SafetyScore score={worker.safety_score} level={worker.interaction_level} compact />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Cert alerts */}
        {(expiringCerts.length > 0 || expiredCerts.length > 0) && (
          <div className="space-y-2">
            {expiredCerts.map(cert => (
              <div key={cert.id} className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">{cert.cert_name} has expired</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  Expired {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('en-AU') : ''}
                </p>
              </div>
            ))}
            {expiringCerts.map(cert => (
              <div key={cert.id} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">{cert.cert_name} expiring soon</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Expires {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('en-AU') : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Session types */}
        <div className="space-y-3">
          {SESSION_TYPES.map(({ type, label, description, icon }) => (
            <Link
              key={type}
              href={type === 'report' ? '/report' : `/session/${type}`}
              className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-5 hover:border-sky-300 dark:hover:border-sky-700 transition-colors active:bg-zinc-50 dark:active:bg-zinc-800"
            >
              <div className="text-sky-600 dark:text-sky-400 shrink-0">{icon}</div>
              <div className="flex-1">
                <p className="text-base font-semibold text-zinc-900 dark:text-white">{label}</p>
                <p className="text-sm text-zinc-500">{description}</p>
              </div>
              <svg className="w-5 h-5 text-zinc-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Stats + History */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{worker.total_sessions}</p>
            <p className="text-xs text-zinc-500">Sessions</p>
          </div>
          <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{worker.total_reports}</p>
            <p className="text-xs text-zinc-500">Reports</p>
          </div>
          <Link href="/history" className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-center hover:border-sky-300 dark:hover:border-sky-700 transition-colors">
            <p className="text-2xl font-bold text-sky-600">
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </p>
            <p className="text-xs text-zinc-500">History</p>
          </Link>
        </div>

        {/* Recent activity */}
        {recentSessions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent</h2>
              <Link href="/history" className="text-xs text-sky-600 font-medium">View all</Link>
            </div>
            <div className="space-y-2">
              {recentSessions.map(session => (
                <div key={session.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-sky-600">{TYPE_LABELS[session.session_type]}</span>
                      <span className="text-xs text-zinc-400">{formatDate(session.created_at)}</span>
                    </div>
                  </div>
                  {session.summary && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{session.summary.substring(0, 100)}{session.summary.length > 100 ? '...' : ''}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
