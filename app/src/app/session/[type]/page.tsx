'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VoiceRecorder from '@/components/VoiceRecorder';
import ConversationView from '@/components/ConversationView';
import WeatherBanner from '@/components/WeatherBanner';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface WeatherData {
  temp: number;
  conditions: string;
  wind_speed: number;
  wind_dir: string;
  humidity: number;
  uv_index: number;
}

const TYPE_LABELS: Record<string, string> = {
  'pre-start': 'Pre-Start',
  'toolbox-talk': 'Toolbox Talk',
  'form-assist': 'Form Assistant',
  'report': 'Report',
  'reflection': 'Reflection',
};

export default function SessionPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
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
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const startSession = useCallback(async (wId: string) => {
    let loc: { lat: number; lng: number } | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(loc);
    } catch {
      // Location not available
    }

    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          worker_id: wId,
          session_type: type,
          latitude: loc?.lat,
          longitude: loc?.lng,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session.id);
        setMessages(data.messages);
        if (data.weather) {
          setWeather(data.weather);
          // Fetch hazards from weather API
          try {
            const weatherRes = await fetch(`/api/weather?lat=${loc?.lat}&lng=${loc?.lng}`);
            if (weatherRes.ok) {
              const weatherData = await weatherRes.json();
              setWeatherHazards(weatherData.hazards || []);
            }
          } catch {
            // weather hazards not critical
          }
        }
      }
    } catch {
      // Failed to start session
    }
    setStarting(false);
  }, [type]);

  useEffect(() => {
    const stored = localStorage.getItem('coassure_worker_id');
    if (!stored) {
      router.push('/profile/setup');
      return;
    }
    setWorkerId(stored);
    startSession(stored);
  }, [router, startSession]);

  const sendMessage = useCallback(async (text: string) => {
    if (!sessionId || !text.trim() || loading || !workerId) return;

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: text.trim() }]);
    setTextInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          session_id: sessionId,
          worker_id: workerId,
          content: text.trim(),
          latitude: location?.lat,
          longitude: location?.lng,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          { id: `assistant-${Date.now()}`, role: 'assistant', content: data.response },
        ]);
      }
    } catch {
      // Send failed
    }
    setLoading(false);
  }, [sessionId, loading, workerId, location]);

  const handleComplete = async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', session_id: sessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCompleted(true);
        setSummary(data.session.summary);
      }
    } catch {
      // Complete failed
    }
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
            <button
              onClick={() => {
                if (summary) {
                  navigator.clipboard.writeText(
                    `${summary}\n\n---\nGenerated by CoAssure | ${new Date().toLocaleDateString('en-AU')}`
                  );
                }
              }}
              className="flex-1 bg-sky-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-sky-700"
            >
              Copy to Clipboard
            </button>
            <Link
              href="/"
              className="flex-1 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-sm font-medium text-center"
            >
              Home
            </Link>
          </div>

          <p className="text-[10px] text-zinc-400 text-center">
            Generated by CoAssure &mdash; coassure.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-sky-600 text-sm font-medium">&larr;</Link>
          <h1 className="text-base font-bold text-zinc-900 dark:text-white">{TYPE_LABELS[type] || 'Session'}</h1>
          <button
            onClick={handleComplete}
            disabled={loading || messages.length < 3}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-zinc-300 disabled:cursor-not-allowed"
          >
            Done
          </button>
        </div>
      </div>

      {/* Weather banner */}
      {weather && (
        <div className="px-4 pt-3 max-w-lg mx-auto w-full shrink-0">
          <WeatherBanner
            temp={weather.temp}
            conditions={weather.conditions}
            wind_speed={weather.wind_speed}
            wind_dir={weather.wind_dir}
            hazards={weatherHazards}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden max-w-lg mx-auto w-full">
        <ConversationView messages={messages} loading={loading} />
      </div>

      {/* Input area */}
      <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 shrink-0">
        <div className="max-w-lg mx-auto space-y-3">
          <VoiceRecorder onTranscript={sendMessage} disabled={loading} />

          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Or type here..."
              className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !textInput.trim()}
              className="bg-sky-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
