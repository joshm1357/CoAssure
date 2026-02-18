'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessions, getReports } from '@/lib/client-db';
import type { Session, Report } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  'pre-start': 'Pre-Start',
  'toolbox-talk': 'Toolbox Talk',
  'form-assist': 'Form Assistant',
  'report': 'Report',
  'reflection': 'Reflection',
};

const TYPE_COLORS: Record<string, string> = {
  'pre-start': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  'toolbox-talk': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  'form-assist': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'report': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'reflection': 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  'near-miss': 'Near Miss',
  'hazard': 'Hazard',
  'good-catch': 'Good Catch',
  'observation': 'Observation',
};

const REPORT_COLORS: Record<string, string> = {
  'near-miss': 'bg-amber-100 text-amber-800',
  'hazard': 'bg-red-100 text-red-800',
  'good-catch': 'bg-emerald-100 text-emerald-800',
  'observation': 'bg-sky-100 text-sky-800',
};

type TabType = 'sessions' | 'reports';

export default function HistoryPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const workerId = localStorage.getItem('coassure_worker_id');
    if (!workerId) { router.push('/profile/setup'); return; }
    setSessions(getSessions(workerId));
    setReports(getReports(workerId));
  }, [router]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return `Today, ${d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`;
    if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-sky-600 text-sm font-medium">&larr; Home</Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">History</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-4">
          <button onClick={() => setTab('sessions')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'sessions' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
            Sessions ({sessions.length})
          </button>
          <button onClick={() => setTab('reports')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'reports' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
            Reports ({reports.length})
          </button>
        </div>

        {/* Sessions list */}
        {tab === 'sessions' && (
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-sm">No sessions yet</p>
                <Link href="/" className="text-sky-600 text-sm font-medium mt-2 inline-block">Start your first session</Link>
              </div>
            ) : sessions.map(session => (
              <div key={session.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <button onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                  className="w-full px-4 py-3 text-left flex items-center gap-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLORS[session.session_type] || ''}`}>
                    {TYPE_LABELS[session.session_type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500">{formatDate(session.created_at)}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {session.status}
                  </span>
                  <svg className={`w-4 h-4 text-zinc-400 transition-transform ${expandedId === session.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedId === session.id && session.summary && (
                  <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                      {session.summary}
                    </div>
                    <button onClick={() => {
                      navigator.clipboard.writeText(`${session.summary}\n\n---\nGenerated by CoAssure | ${new Date(session.created_at).toLocaleDateString('en-AU')}`);
                    }} className="mt-3 text-xs text-sky-600 font-medium">Copy summary</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reports list */}
        {tab === 'reports' && (
          <div className="space-y-2">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-sm">No reports yet</p>
                <Link href="/report" className="text-sky-600 text-sm font-medium mt-2 inline-block">File your first report</Link>
              </div>
            ) : reports.map(report => (
              <div key={report.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <button onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                  className="w-full px-4 py-3 text-left flex items-center gap-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${REPORT_COLORS[report.report_type] || ''}`}>
                    {REPORT_TYPE_LABELS[report.report_type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900 dark:text-white truncate">{report.description.substring(0, 60)}{report.description.length > 60 ? '...' : ''}</p>
                    <p className="text-xs text-zinc-500">{formatDate(report.created_at)}</p>
                  </div>
                  {report.severity && (
                    <span className="text-[10px] font-medium text-zinc-500 capitalize">{report.severity}</span>
                  )}
                  <svg className={`w-4 h-4 text-zinc-400 transition-transform ${expandedId === report.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedId === report.id && (
                  <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 mt-2">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{report.description}</p>
                    {report.contributing_factors && (
                      <div>
                        <p className="text-xs font-medium text-zinc-500">Contributing factors</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{report.contributing_factors}</p>
                      </div>
                    )}
                    {report.actions_taken && (
                      <div>
                        <p className="text-xs font-medium text-zinc-500">Actions taken</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{report.actions_taken}</p>
                      </div>
                    )}
                    {report.is_anonymous && (
                      <p className="text-xs text-zinc-400 italic">Submitted anonymously</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
