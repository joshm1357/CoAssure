'use client';

import { useState } from 'react';

interface TrainingRecord {
  id: string;
  cert_type: string;
  cert_name: string;
  issued_date: string | null;
  expiry_date: string | null;
  issuer: string | null;
  status: 'current' | 'expiring' | 'expired';
}

interface TrainingListProps {
  records: TrainingRecord[];
  workerId: string;
  onUpdate: () => void;
}

const CERT_TYPES = [
  'White Card',
  'First Aid',
  'Working at Heights',
  'Confined Space',
  'EWP',
  'Forklift',
  'Dogging',
  'Rigging',
  'Scaffolding',
  'Electrical License',
  'Plumbing License',
  'Gas Fitting',
  'Asbestos Awareness',
  'Traffic Control',
  'Other',
];

export default function TrainingList({ records, workerId, onUpdate }: TrainingListProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cert_type: '',
    cert_name: '',
    issued_date: '',
    expiry_date: '',
    issuer: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/worker/${workerId}/training`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ cert_type: '', cert_name: '', issued_date: '', expiry_date: '', issuer: '' });
        setShowForm(false);
        onUpdate();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    const res = await fetch(`/api/worker/${workerId}/training?record_id=${recordId}`, {
      method: 'DELETE',
    });
    if (res.ok) onUpdate();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'current': return 'bg-emerald-100 text-emerald-800';
      case 'expiring': return 'bg-amber-100 text-amber-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Training & Certifications</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-sky-600 hover:text-sky-700 font-medium"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Type</label>
            <select
              value={formData.cert_type}
              onChange={e => {
                setFormData(prev => ({
                  ...prev,
                  cert_type: e.target.value,
                  cert_name: e.target.value !== 'Other' ? e.target.value : prev.cert_name,
                }));
              }}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700"
              required
            >
              <option value="">Select...</option>
              {CERT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {formData.cert_type === 'Other' && (
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Name</label>
              <input
                type="text"
                value={formData.cert_name}
                onChange={e => setFormData(prev => ({ ...prev, cert_name: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700"
                placeholder="e.g. Crane Operator"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Issued</label>
              <input
                type="date"
                value={formData.issued_date}
                onChange={e => setFormData(prev => ({ ...prev, issued_date: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Expires</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={e => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Issuer</label>
            <input
              type="text"
              value={formData.issuer}
              onChange={e => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700"
              placeholder="e.g. SafeWork NSW"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-sky-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Certification'}
          </button>
        </form>
      )}

      {records.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">No training records yet</p>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div key={record.id} className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-700">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{record.cert_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${getStatusStyle(record.status)}`}>
                    {record.status}
                  </span>
                  {record.expiry_date && (
                    <span className="text-xs text-zinc-500">
                      Expires {new Date(record.expiry_date).toLocaleDateString('en-AU')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(record.id)}
                className="text-zinc-400 hover:text-red-500 p-1"
                aria-label="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
