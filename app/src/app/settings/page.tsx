'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiKey, setApiKey, getApiProxyUrl, setApiProxyUrl } from '@/lib/client-db';

export default function SettingsPage() {
  const [apiKey, setApiKeyState] = useState('');
  const [proxyUrl, setProxyUrlState] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    setApiKeyState(getApiKey() || '');
    setProxyUrlState(getApiProxyUrl() || '');
  }, []);

  const handleSave = () => {
    setApiKey(apiKey.trim());
    setApiProxyUrl(proxyUrl.trim());
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    const key = apiKey.trim();
    const proxy = proxyUrl.trim();

    try {
      if (proxy) {
        const res = await fetch(proxy, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 20,
            messages: [{ role: 'user', content: 'Reply with just the word "connected"' }],
          }),
        });
        if (res.ok) {
          setTestResult({ ok: true, message: 'Proxy connection successful' });
        } else {
          setTestResult({ ok: false, message: `Proxy error: ${res.status}` });
        }
      } else if (key) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 20,
            messages: [{ role: 'user', content: 'Reply with just the word "connected"' }],
          }),
        });
        if (res.ok) {
          setTestResult({ ok: true, message: 'API key is valid and working' });
        } else {
          if (res.status === 401) {
            setTestResult({ ok: false, message: 'Invalid API key' });
          } else {
            setTestResult({ ok: false, message: `API error: ${res.status}` });
          }
        }
      } else {
        setTestResult({ ok: false, message: 'Add an API key or proxy URL first' });
      }
    } catch {
      setTestResult({ ok: false, message: 'Connection failed. Check your network or URL.' });
    }

    setTesting(false);
  };

  const handleClearData = () => {
    if (confirm('This will delete all your CoAssure data (profile, sessions, reports). Are you sure?')) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('coassure_'));
      keys.forEach(k => localStorage.removeItem(k));
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-sky-600 text-sm font-medium">&larr; Home</Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Settings</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">AI Configuration</h2>
            <p className="text-xs text-zinc-500">
              CoAssure uses Claude to power safety conversations. Add your Anthropic API key to enable AI features.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Anthropic API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKeyState(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white font-mono"
              placeholder="sk-ant-..."
            />
            <p className="text-[10px] text-zinc-400 mt-1">Stored locally in your browser. Never sent to our servers.</p>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">API Proxy URL (advanced)</label>
            <input
              type="url"
              value={proxyUrl}
              onChange={e => setProxyUrlState(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white font-mono"
              placeholder="https://your-proxy.example.com/api/messages"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              If you run your own proxy, enter the URL here. Proxy takes priority over direct API key.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-sky-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-sky-700"
            >
              {saved ? 'Saved' : 'Save Settings'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || (!apiKey.trim() && !proxyUrl.trim())}
              className="px-4 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test'}
            </button>
          </div>

          {testResult && (
            <div className={`rounded-lg px-3 py-2 text-xs ${testResult.ok ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'}`}>
              {testResult.message}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">About</h2>
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>CoAssure is a voice-first safety co-pilot for field workers and teams.</p>
            <p>All data is stored locally in your browser. Nothing is sent to external servers except AI conversation messages (to the Anthropic API when configured).</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">Data</h2>
          <p className="text-xs text-zinc-500 mb-3">All your data is stored in this browser. Clearing browser data or switching devices will reset everything.</p>
          <button onClick={handleClearData}
            className="text-sm text-red-600 font-medium hover:text-red-700">
            Clear all CoAssure data
          </button>
        </div>
      </div>
    </div>
  );
}
