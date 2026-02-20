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
import { getAllTemplates, FormTemplate } from '@/lib/form-templates';
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

const TYPE_DESCRIPTIONS: Record<string, string> = {
  'pre-start': 'Talk through hazards and controls for the job ahead',
  'toolbox-talk': 'Facilitate a team safety discussion',
  'form-assist': 'Fill out a safety form through conversation',
  'report': 'Capture a near-miss, hazard, or observation',
  'reflection': 'Capture what the next person should know',
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
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [showAttendees, setShowAttendees] = useState(type === 'toolbox-talk');
  const [sessionStartTime] = useState(Date.now());
  const [selectedFormTemplate, setSelectedFormTemplate] = useState<FormTemplate | null>(null);
  const [showFormSelector, setShowFormSelector] = useState(type === 'form-assist');

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

    // For form-assist without a selected template, show selector instead of AI greeting
    if (type === 'form-assist' && !selectedFormTemplate) {
      setStarting(false);
      return;
    }

    // Get AI greeting if configured
    if (isAiConfigured()) {
      try {
        const systemPrompt = buildSystemPrompt(profile, type as Session['session_type'], wx, null, selectedFormTemplate);
        addMessage(session.id, 'user', 'Starting session');
        const greeting = await sendToAi(systemPrompt, [{ role: 'user', content: 'Starting session' }]);
        addMessage(session.id, 'assistant', greeting);
        setMessages(getMessages(session.id).map(m => ({ id: m.id, role: m.role as Message['role'], content: m.content })));
      } catch {
        setError('Could not connect to AI. Check your API settings.');
      }
    } else {
      const welcomeMsg = `Welcome to your ${TYPE_LABELS[type] || 'session'}. To enable AI-assisted conversations, add your Anthropic API key in Settings.`;
      setMessages([{ id: 'welcome', role: 'assistant', content: welcomeMsg }]);
    }

    setStarting(false);
  }, [type, selectedFormTemplate]);

  useEffect(() => {
    const stored = localStorage.getItem('coassure_worker_id');
    if (!stored) { router.push('/profile/setup'); return; }
    setWorkerId(stored);
    // For form-assist, show template selector instead of starting session
    if (type === 'form-assist' && showFormSelector && !selectedFormTemplate) {
      setStarting(false);
      return;
    }
    startSession(stored);
  }, [router, startSession, type, showFormSelector, selectedFormTemplate]);

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

      const systemPrompt = buildSystemPrompt(profile, type as Session['session_type'], weather, null, selectedFormTemplate);
      const response = await sendToAi(systemPrompt, allMsgs);
      addMessage(sessionId, 'assistant', response);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: response }]);
    } catch {
      setError('AI response failed. Check your connection or API settings.');
    }
    setLoading(false);
  }, [sessionId, loading, workerId, aiAvailable, weather, type, selectedFormTemplate]);

  const handleComplete = async () => {
    if (!sessionId) return;
    setLoading(true);

    const allMsgs = getMessages(sessionId);
    const transcript = allMsgs.map(m => `${m.role === 'user' ? 'Worker' : 'CoAssure'}: ${m.content}`).join('\n\n');

    // Add attendees to transcript for toolbox talks
    let fullTranscript = transcript;
    if (type === 'toolbox-talk' && attendees.length > 0) {
      fullTranscript = `Attendees: ${attendees.join(', ')}\n\n${transcript}`;
    }

    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    let sum = 'Session completed. AI summary unavailable.';
    if (aiAvailable) {
      try { sum = await generateSummary(fullTranscript, type as Session['session_type']); } catch { /* keep default */ }
    }

    completeDbSession(sessionId, sum, fullTranscript);
    setCompleted(true);
    setSummary(sum);
    setLoading(false);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(textInput);
  };

  const addAttendee = () => {
    const name = attendeeInput.trim();
    if (name && !attendees.includes(name)) {
      setAttendees(prev => [...prev, name]);
    }
    setAttendeeInput('');
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
          <p className="text-xs text-zinc-500 text-center mt-0.5">{TYPE_LABELS[type]} &middot; {new Date().toLocaleDateString('en-AU')}</p>
        </div>
        <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4 overflow-y-auto">
          {type === 'toolbox-talk' && attendees.length > 0 && (
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wider mb-2">Attendees ({attendees.length})</h3>
              <p className="text-sm text-sky-800 dark:text-sky-200">{attendees.join(', ')}</p>
            </div>
          )}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Summary</h2>
            <div className="text-sm text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap leading-relaxed">{summary}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => {
              const attendeeText = (type === 'toolbox-talk' && attendees.length > 0)
                ? `Attendees: ${attendees.join(', ')}\n\n`
                : '';
              if (summary) navigator.clipboard.writeText(`${attendeeText}${summary}\n\n---\nGenerated by CoAssure | ${new Date().toLocaleDateString('en-AU')}`);
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
          <div className="text-center">
            <h1 className="text-base font-bold text-zinc-900 dark:text-white">{TYPE_LABELS[type] || 'Session'}</h1>
            <p className="text-[10px] text-zinc-500">{TYPE_DESCRIPTIONS[type]}</p>
          </div>
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

      {/* Form template selector for form-assist */}
      {type === 'form-assist' && showFormSelector && !selectedFormTemplate && (
        <div className="px-4 pt-3 max-w-lg mx-auto w-full shrink-0">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Which form are you filling out?</h3>
            <div className="space-y-2">
              {getAllTemplates().map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedFormTemplate(template);
                    setShowFormSelector(false);
                  }}
                  className="w-full text-left bg-zinc-50 dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-sky-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-sky-300 dark:hover:border-sky-700 rounded-xl px-4 py-3 transition-colors"
                >
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{template.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{template.description}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400">Select a form type, or just start talking and the AI will help you figure out which form to use.</p>
            <button
              onClick={() => {
                setShowFormSelector(false);
              }}
              className="text-xs text-sky-600 font-medium hover:text-sky-700"
            >
              Skip — let AI decide
            </button>
          </div>
        </div>
      )}

      {/* Show selected form badge */}
      {type === 'form-assist' && selectedFormTemplate && (
        <div className="px-4 pt-2 max-w-lg mx-auto w-full shrink-0">
          <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg px-3 py-2">
            <span className="text-xs text-sky-700 dark:text-sky-300 font-medium flex-1">{selectedFormTemplate.name}</span>
            <button onClick={() => { setSelectedFormTemplate(null); setShowFormSelector(true); }}
              className="text-xs text-sky-500 hover:text-sky-700">Change</button>
          </div>
        </div>
      )}

      {/* Toolbox talk attendee bar */}
      {type === 'toolbox-talk' && (
        <div className="px-4 pt-2 max-w-lg mx-auto w-full shrink-0">
          <button onClick={() => setShowAttendees(!showAttendees)}
            className="w-full text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm">
            <span className="text-zinc-500">Attendees:</span>
            <span className="text-zinc-900 dark:text-white ml-1 font-medium">
              {attendees.length > 0 ? `${attendees.join(', ')} (${attendees.length})` : 'Tap to add'}
            </span>
          </button>
          {showAttendees && (
            <div className="mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2">
              <form onSubmit={(e) => { e.preventDefault(); addAttendee(); }} className="flex gap-2">
                <input type="text" value={attendeeInput} onChange={e => setAttendeeInput(e.target.value)}
                  placeholder="Name" className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:text-white" />
                <button type="submit" className="bg-sky-600 text-white rounded-lg px-3 py-2 text-sm font-medium">Add</button>
              </form>
              {attendees.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {attendees.map((name, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 text-xs">
                      {name}
                      <button onClick={() => setAttendees(prev => prev.filter((_, j) => j !== i))}
                        className="text-zinc-400 hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
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
