'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VoiceRecorder from '@/components/VoiceRecorder';
import ConversationView from '@/components/ConversationView';
import WeatherBanner from '@/components/WeatherBanner';
import { getWorkerProfile, createSession as createDbSession, addMessage, getMessages, completeSession as completeDbSession } from '@/lib/client-db';
import { getWeather, getWeatherHazards } from '@/lib/weather';
import { buildSystemPrompt, sendToAi, isAiConfigured, generateSummary } from '@/lib/client-conversation';
import type { WeatherData, Session } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const TYPE_LABELS: Record<string, string> = {
  'pre-start': 'Pre-Start',
  'toolbox-talk': 'Toolbox Talk',
  'form-assist': 'Form Assistant',
  'report': 'Report',
  'reflection': 'Reflection',
};

export default function SessionClient({ type }: { type: string }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherHazards, setWeatherHazards] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async (wId: string) => {
    const profile = getWorkerProfile(wId);
    if (!profile) { setStarting(false); return; }

    setAiAvailable(isAiConfigured());

    // Get location + weather
    let loc: { lat: number; lng: number } | null = null;
    let wx: WeatherData | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      try {
        wx = await getWeather(loc.lat, loc.lng);
        setWeather(wx);
        setWeatherHazards(getWeatherHazards(wx));
      } catch { /* weather not critical */ }
    } catch { /* location not available */ }

    // Create session in local storage
    const session = createDbSession({
      worker_id: wId,
      session_type: type as Session['session_type'],
      location_lat: loc?.lat,
      location_lng: loc?.lng,
      weather_temp: wx?.temp,
      weather_conditions: wx?.conditions,
      weather_wind_speed: wx?.wind_speed,
      weather_wind_dir: wx?.wind_dir,
    });
    setSessionId(session.id);

    // Get AI greeting if configured
    if (isAiConfigured()) {
      try {
        const systemPrompt = buildSystemPrompt(profile, type as Session['session_type'], wx, null);
        addMessage(session.id, 'user', 'Starting session');
        const greeting = await sendToAi(systemPrompt, [{ role: 'user', content: 'Starting session' }]);
        addMessage(session.id, 'assistant', greeting);
        setMessages(getMessages(session.id).map(m => ({ id: m.id, role: m.role as Message['role'], content: m.content })));
      } catch (err) {
        setError('Could not connect to AI. Check your API settings.');
      }
    } else {
      // Show message that AI needs configuration
      const welcomeMsg = `Welcome to your ${TYPE_LABELS[type] || 'session'}. To enable AI-assisted conversations, add your Anthropic API key in Settings.`;
      setMessages([{ id: 'welcome', role: 'assistant', content: welcomeMsg }]);
    }

    setStarting(false);
  }, [type]);

  useEffect(() => {
    const stored = localStorage.getItem('coassure_worker_id');
    if (!stored) { router.push('/profile/setup'); return; }
    setWorkerId(stored);
    startSession(stored);
  }, [router, startSession]);

  const sendMessage = useCallback(async (text: string) => {
    if (!sessionId || !text.trim() || loading || !workerId || !aiAvailable) return;
    setError(null);

    const profile = getWorkerProfile(workerId);
    if (!profile) return;

    addMessage(sessionId, 'user', text.trim());
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text.trim() }]);
    setTextInput('');
    setLoading(true);

    try {
      const allMsgs = getMessages(sessionId)
        .filter(m => m.content !== 'Starting session')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const systemPrompt = buildSystemPrompt(profile, type as Session['session_type'], weather, null);
      const response = await sendToAi(systemPrompt, allMsgs);
      addMessage(sessionId, 'assistant', response);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: response }]);
    } catch {
      setError('AI response failed. Check your connection or API settings.');
    }
    setLoading(false);
  }, [sessionId, loading, workerId, aiAvailable, weather, type]);

  const handleComplete = async () => {
    if (!sessionId) return;
    setLoading(true);

    const allMsgs = getMessages(sessionId);
    const transcript = allMsgs.map(m => `${m.role === 'user' ? 'Worker' : 'CoAssure'}: ${m.content}`).join('\n\n');

    let sum = 'Session completed. AI summary unavailable.';
    if (aiAvailable) {
      try { sum = await generateSummary(transcript); } catch { /* keep default */ }
    }

    completeDbSession(sessionId, sum, transcript);
    setCompleted(true);
    setSummary(sum);
    setLoading(false);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(textInput);
  };

  if (starting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse text-zinc-400 mb-2">Starting {TYPE_LABELS[type] || 'session'}...</div>
        <p className="text-xs text-zinc-400">Getting weather and location</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white text-center">Session Complete</h1>
        </div>
        <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Summary</h2>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap">{summary}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => {
              if (summary) navigator.clipboard.writeText(`${summary}\n\n---\nGenerated by CoAssure | ${new Date().toLocaleDateString('en-AU')}`);
            }} className="flex-1 bg-sky-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-sky-700">Copy to Clipboard</button>
            <Link href="/" className="flex-1 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-sm font-medium text-center">Home</Link>
          </div>
          <p className="text-[10px] text-zinc-400 text-center">Generated by CoAssure &mdash; coassure.com</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-sky-600 text-sm font-medium">&larr;</Link>
          <h1 className="text-base font-bold text-zinc-900 dark:text-white">{TYPE_LABELS[type] || 'Session'}</h1>
          <button onClick={handleComplete} disabled={loading || messages.length < 2}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-zinc-300 disabled:cursor-not-allowed">Done</button>
        </div>
      </div>

      {weather && (
        <div className="px-4 pt-3 max-w-lg mx-auto w-full shrink-0">
          <WeatherBanner temp={weather.temp} conditions={weather.conditions} wind_speed={weather.wind_speed} wind_dir={weather.wind_dir} hazards={weatherHazards} />
        </div>
      )}

      {error && (
        <div className="px-4 pt-2 max-w-lg mx-auto w-full shrink-0">
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>
        </div>
      )}

      {!aiAvailable && (
        <div className="px-4 pt-2 max-w-lg mx-auto w-full shrink-0">
          <Link href="/settings" className="block text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 rounded-lg px-3 py-2 text-center">
            AI not configured &mdash; tap to add your API key in Settings
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-hidden max-w-lg mx-auto w-full">
        <ConversationView messages={messages} loading={loading} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 shrink-0">
        <div className="max-w-lg mx-auto space-y-3">
          <VoiceRecorder onTranscript={sendMessage} disabled={loading || !aiAvailable} />
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder={aiAvailable ? 'Or type here...' : 'Configure AI in Settings to chat'}
              className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white" disabled={loading || !aiAvailable} />
            <button type="submit" disabled={loading || !textInput.trim() || !aiAvailable}
              className="bg-sky-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-sky-700 disabled:opacity-50">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
