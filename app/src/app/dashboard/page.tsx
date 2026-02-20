'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSessions, getReports, getRecentReports } from '@/lib/client-db';
import type { Session, Report } from '@/lib/types';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    const workerId = localStorage.getItem('coassure_worker_id');
    if (!workerId) return;
    setSessions(getSessions(workerId));
    setReports(getReports(workerId));
    setRecentReports(getRecentReports(timeframe));
  }, [timeframe]);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const thisWeekSessions = sessions.filter(s => {
    const d = new Date(s.created_at);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return d > weekAgo;
  });

  const openReports = reports.filter(r => r.status === 'open');
  const nearMisses = recentReports.filter(r => r.report_type === 'near-miss');
  const hazards = recentReports.filter(r => r.report_type === 'hazard');
  const goodCatches = recentReports.filter(r => r.report_type === 'good-catch');

  const sessionsByType = completedSessions.reduce((acc, s) => {
    acc[s.session_type] = (acc[s.session_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityCounts = recentReports.reduce((acc, r) => {
    if (r.severity) acc[r.severity] = (acc[r.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-sky-600 text-sm font-medium">&larr; Home</Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Dashboard</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Timeframe selector */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          {([7, 30, 90] as const).map(t => (
            <button key={t} onClick={() => setTimeframe(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${timeframe === t ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
              {t === 7 ? '7 days' : t === 30 ? '30 days' : '90 days'}
            </button>
          ))}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4">
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{thisWeekSessions.length}</p>
            <p className="text-xs text-zinc-500">Sessions this week</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4">
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{recentReports.length}</p>
            <p className="text-xs text-zinc-500">Reports ({timeframe}d)</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4">
            <p className="text-3xl font-bold text-amber-600">{openReports.length}</p>
            <p className="text-xs text-zinc-500">Open reports</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4">
            <p className="text-3xl font-bold text-emerald-600">{goodCatches.length}</p>
            <p className="text-xs text-zinc-500">Good catches ({timeframe}d)</p>
          </div>
        </div>

        {/* Report breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Report Types ({timeframe} days)</h2>
          <div className="space-y-2">
            {[
              { label: 'Near Misses', count: nearMisses.length, color: 'bg-amber-500' },
              { label: 'Hazards', count: hazards.length, color: 'bg-red-500' },
              { label: 'Good Catches', count: goodCatches.length, color: 'bg-emerald-500' },
              { label: 'Observations', count: recentReports.filter(r => r.report_type === 'observation').length, color: 'bg-sky-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">{label}</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{count}</span>
                {recentReports.length > 0 && (
                  <div className="w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                    <div className={`${color} rounded-full h-2`} style={{ width: `${Math.max(4, (count / Math.max(recentReports.length, 1)) * 100)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Severity breakdown */}
        {Object.keys(severityCounts).length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Severity Distribution</h2>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'critical'].map(sev => {
                const count = severityCounts[sev] || 0;
                const colors: Record<string, string> = { low: 'bg-blue-500', medium: 'bg-amber-500', high: 'bg-orange-500', critical: 'bg-red-500' };
                return (
                  <div key={sev} className="flex-1 text-center">
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">{count}</div>
                    <div className={`h-1 rounded-full ${colors[sev]} mt-1`} />
                    <div className="text-[10px] text-zinc-500 mt-1 capitalize">{sev}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Session breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Session Types (all time)</h2>
          <div className="space-y-2">
            {[
              { key: 'pre-start', label: 'Pre-Start' },
              { key: 'toolbox-talk', label: 'Toolbox Talk' },
              { key: 'form-assist', label: 'Form Assistant' },
              { key: 'reflection', label: 'Reflection' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{sessionsByType[key] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-3">
          <Link href="/history" className="flex-1 bg-sky-600 text-white rounded-xl py-3 text-sm font-semibold text-center hover:bg-sky-700">View Full History</Link>
          <Link href="/report" className="flex-1 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-sm font-medium text-center">New Report</Link>
        </div>
      </div>
    </div>
  );
}
