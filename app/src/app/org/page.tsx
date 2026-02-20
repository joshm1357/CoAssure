'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'worker';
  status: 'active' | 'pending';
}

export default function OrgPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'members' | 'templates' | 'sites' | 'settings'>('members');
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'worker' | 'supervisor'>('worker');

  useEffect(() => {
    // In production, load from Supabase. For now, show demo data
    setMembers([
      { id: '1', name: 'Dave Mitchell', email: 'dave@example.com', role: 'admin', status: 'active' },
      { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', role: 'supervisor', status: 'active' },
      { id: '3', name: 'Mike Petrov', email: 'mike@example.com', role: 'worker', status: 'active' },
      { id: '4', name: 'Jake Williams', email: 'jake@example.com', role: 'worker', status: 'active' },
      { id: '5', name: 'Tom Nguyen', email: 'tom@example.com', role: 'worker', status: 'pending' },
    ]);
  }, []);

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setMembers(prev => [...prev, {
      id: `new-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
    }]);
    setInviteEmail('');
    setShowInvite(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-violet-100 text-violet-800';
      case 'supervisor': return 'bg-sky-100 text-sky-800';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-sky-600 text-sm font-medium">&larr; Home</Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Organisation</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-4 text-sm">
          {(['members', 'templates', 'sites', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 font-medium rounded-lg transition-colors capitalize ${tab === t ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Members tab */}
        {tab === 'members' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Team ({members.length})</h2>
              <button onClick={() => setShowInvite(!showInvite)} className="text-sm text-sky-600 font-medium">
                {showInvite ? 'Cancel' : '+ Invite'}
              </button>
            </div>

            {showInvite && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:text-white"
                  placeholder="Email address" />
                <div className="flex gap-2">
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'worker' | 'supervisor')}
                    className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:text-white">
                    <option value="worker">Worker</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                  <button onClick={handleInvite} className="bg-sky-600 text-white rounded-lg px-4 py-2 text-sm font-medium">Send Invite</button>
                </div>
              </div>
            )}

            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{member.name}</p>
                  <p className="text-xs text-zinc-500">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${getRoleBadge(member.role)}`}>
                    {member.role}
                  </span>
                  {member.status === 'pending' && (
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates tab */}
        {tab === 'templates' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Form Templates</h2>
              <Link href="/org/templates/upload" className="text-sm text-sky-600 font-medium">+ Upload</Link>
            </div>

            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wider mb-2">Standard Templates</h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 mb-3">Available to all users unless restricted</p>
              {['Take 5', 'JSA (Job Safety Analysis)', 'SWMS (Safe Work Method Statement)', 'Site Diary'].map(t => (
                <div key={t} className="flex items-center justify-between py-2 border-t border-sky-200 dark:border-sky-800 first:border-t-0">
                  <span className="text-sm text-sky-800 dark:text-sky-200">{t}</span>
                  <span className="text-[10px] text-sky-600 bg-sky-100 dark:bg-sky-900 px-2 py-0.5 rounded-full">Standard</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-400 text-center py-4">Upload your own forms — workers can fill them out by talking to CoAssure</p>
          </div>
        )}

        {/* Sites tab */}
        {tab === 'sites' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sites</h2>
              <button className="text-sm text-sky-600 font-medium">+ Add Site</button>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Barangaroo Tower</p>
              <p className="text-xs text-zinc-500">Barangaroo, Sydney NSW</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">Active</span>
                <span className="text-xs text-zinc-400">Construction phase</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 text-center py-4">Add sites to organise sessions and reports by location</p>
          </div>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Organisation Details</h2>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                <input type="text" defaultValue="Mitchell Electrical Pty Ltd"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">ABN</label>
                <input type="text" defaultValue="12 345 678 901"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white" />
              </div>
              <button className="w-full bg-sky-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-sky-700">Save</button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Plan</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">Free Plan</p>
                  <p className="text-xs text-zinc-500">10 sessions/month, 1 user</p>
                </div>
                <Link href="/billing" className="text-sm text-sky-600 font-medium">Upgrade</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
