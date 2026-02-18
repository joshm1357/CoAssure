// Client-side storage using localStorage — replaces SQLite for static deployment
// All data persists in the browser. Each collection is stored as a JSON array.

import { Worker, TrainingRecord, WorkerProfile, Session, Report, ConversationMessage } from './types';

function genId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function getCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`coassure_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCollection<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`coassure_${key}`, JSON.stringify(data));
}

// --- Workers ---

export function createWorker(data: {
  name: string;
  trade?: string;
  years_experience?: number;
  years_with_company?: number;
  email?: string;
  phone?: string;
  org_id?: string;
}): Worker {
  const worker: Worker = {
    id: genId(),
    name: data.name,
    trade: data.trade || null,
    years_experience: data.years_experience || 0,
    years_with_company: data.years_with_company || 0,
    email: data.email || null,
    phone: data.phone || null,
    org_id: data.org_id || null,
    created_at: now(),
  };

  const workers = getCollection<Worker>('workers');
  workers.push(worker);
  setCollection('workers', workers);
  return worker;
}

export function getWorker(id: string): Worker | null {
  const workers = getCollection<Worker>('workers');
  return workers.find(w => w.id === id) || null;
}

export function updateWorker(id: string, data: Partial<Omit<Worker, 'id' | 'created_at'>>): Worker | null {
  const workers = getCollection<Worker>('workers');
  const idx = workers.findIndex(w => w.id === id);
  if (idx === -1) return null;

  workers[idx] = { ...workers[idx], ...data };
  setCollection('workers', workers);
  return workers[idx];
}

// --- Training Records ---

export function addTrainingRecord(data: {
  worker_id: string;
  cert_type: string;
  cert_name: string;
  issued_date?: string;
  expiry_date?: string;
  issuer?: string;
}): TrainingRecord {
  let status: 'current' | 'expiring' | 'expired' = 'current';
  if (data.expiry_date) {
    const expiry = new Date(data.expiry_date);
    const n = new Date();
    const thirtyDays = new Date(n.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (expiry < n) status = 'expired';
    else if (expiry < thirtyDays) status = 'expiring';
  }

  const record: TrainingRecord = {
    id: genId(),
    worker_id: data.worker_id,
    cert_type: data.cert_type,
    cert_name: data.cert_name,
    issued_date: data.issued_date || null,
    expiry_date: data.expiry_date || null,
    issuer: data.issuer || null,
    status,
    created_at: now(),
  };

  const records = getCollection<TrainingRecord>('training');
  records.push(record);
  setCollection('training', records);
  return record;
}

export function getTrainingRecords(workerId: string): TrainingRecord[] {
  const records = getCollection<TrainingRecord>('training');
  const workerRecords = records.filter(r => r.worker_id === workerId);

  // Update statuses based on current date
  const n = new Date();
  const thirtyDays = new Date(n.getTime() + 30 * 24 * 60 * 60 * 1000);
  let changed = false;

  for (const record of workerRecords) {
    if (record.expiry_date) {
      const expiry = new Date(record.expiry_date);
      const newStatus = expiry < n ? 'expired' : expiry < thirtyDays ? 'expiring' : 'current';
      if (record.status !== newStatus) {
        record.status = newStatus;
        changed = true;
      }
    }
  }

  if (changed) {
    const all = getCollection<TrainingRecord>('training');
    for (const updated of workerRecords) {
      const idx = all.findIndex(r => r.id === updated.id);
      if (idx !== -1) all[idx] = updated;
    }
    setCollection('training', all);
  }

  return workerRecords.sort((a, b) =>
    (b.expiry_date || '').localeCompare(a.expiry_date || '')
  );
}

export function deleteTrainingRecord(id: string): boolean {
  const records = getCollection<TrainingRecord>('training');
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) return false;
  setCollection('training', filtered);
  return true;
}

// --- Sessions ---

export function createSession(data: {
  worker_id: string;
  session_type: Session['session_type'];
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  weather_temp?: number;
  weather_conditions?: string;
  weather_wind_speed?: number;
  weather_wind_dir?: string;
}): Session {
  const session: Session = {
    id: genId(),
    worker_id: data.worker_id,
    session_type: data.session_type,
    status: 'active',
    location_lat: data.location_lat || null,
    location_lng: data.location_lng || null,
    location_address: data.location_address || null,
    weather_temp: data.weather_temp || null,
    weather_conditions: data.weather_conditions || null,
    weather_wind_speed: data.weather_wind_speed || null,
    weather_wind_dir: data.weather_wind_dir || null,
    task_description: null,
    hazards_identified: null,
    controls_confirmed: null,
    ai_prompts: null,
    transcript: null,
    summary: null,
    duration_seconds: null,
    created_at: now(),
    completed_at: null,
  };

  const sessions = getCollection<Session>('sessions');
  sessions.push(session);
  setCollection('sessions', sessions);
  return session;
}

export function getSession(id: string): Session | null {
  return getCollection<Session>('sessions').find(s => s.id === id) || null;
}

export function completeSession(id: string, summary: string, transcript: string): Session | null {
  const sessions = getCollection<Session>('sessions');
  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return null;

  sessions[idx] = {
    ...sessions[idx],
    status: 'completed',
    summary,
    transcript,
    completed_at: now(),
  };
  setCollection('sessions', sessions);
  return sessions[idx];
}

export function countSessions(workerId: string): number {
  return getCollection<Session>('sessions').filter(s => s.worker_id === workerId).length;
}

export function countRecentSessions(workerId: string): number {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return getCollection<Session>('sessions').filter(
    s => s.worker_id === workerId && s.created_at > thirtyDaysAgo
  ).length;
}

// --- Messages ---

export function addMessage(sessionId: string, role: 'user' | 'assistant', content: string): ConversationMessage {
  const msg: ConversationMessage = {
    id: genId(),
    session_id: sessionId,
    role,
    content,
    created_at: now(),
  };

  const messages = getCollection<ConversationMessage>('messages');
  messages.push(msg);
  setCollection('messages', messages);
  return msg;
}

export function getMessages(sessionId: string): ConversationMessage[] {
  return getCollection<ConversationMessage>('messages')
    .filter(m => m.session_id === sessionId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

// --- Reports ---

export function createReport(data: {
  worker_id: string;
  session_id?: string;
  report_type: Report['report_type'];
  severity?: Report['severity'];
  description: string;
  contributing_factors?: string;
  actions_taken?: string;
  recommended_actions?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  is_anonymous?: boolean;
}): Report {
  const report: Report = {
    id: genId(),
    worker_id: data.worker_id,
    session_id: data.session_id || null,
    report_type: data.report_type,
    severity: data.severity || null,
    description: data.description,
    contributing_factors: data.contributing_factors || null,
    actions_taken: data.actions_taken || null,
    recommended_actions: data.recommended_actions || null,
    location_lat: data.location_lat || null,
    location_lng: data.location_lng || null,
    location_address: data.location_address || null,
    photo_path: null,
    is_anonymous: data.is_anonymous || false,
    status: 'open',
    created_at: now(),
  };

  const reports = getCollection<Report>('reports');
  reports.push(report);
  setCollection('reports', reports);
  return report;
}

export function countReports(workerId: string): number {
  return getCollection<Report>('reports').filter(r => r.worker_id === workerId).length;
}

// --- Worker Profile (computed) ---

function calculateSafetyScore(
  worker: Worker,
  training: TrainingRecord[],
  totalSessions: number,
  totalReports: number,
  recentSessions: number
): number {
  let score = 50;
  score += Math.min(worker.years_experience * 1.5, 15);

  const currentTraining = training.filter(t => t.status === 'current').length;
  const totalTraining = training.length;
  if (totalTraining > 0) {
    score += (currentTraining / totalTraining) * 20;
  }

  score += Math.min(recentSessions * 2, 10);
  score += Math.min(totalReports, 5);

  return Math.min(Math.round(score), 100);
}

function determineInteractionLevel(
  worker: Worker,
  safetyScore: number
): 'peer' | 'standard' | 'supportive' {
  if (worker.years_experience >= 10 && safetyScore >= 75) return 'peer';
  if (worker.years_experience >= 3 || safetyScore >= 60) return 'standard';
  return 'supportive';
}

export function getWorkerProfile(workerId: string): WorkerProfile | null {
  const worker = getWorker(workerId);
  if (!worker) return null;

  const training = getTrainingRecords(workerId);
  const totalSessions = countSessions(workerId);
  const recentSessions = countRecentSessions(workerId);
  const totalReports = countReports(workerId);

  const safetyScore = calculateSafetyScore(worker, training, totalSessions, totalReports, recentSessions);
  const interactionLevel = determineInteractionLevel(worker, safetyScore);

  return {
    ...worker,
    training_records: training,
    safety_score: safetyScore,
    interaction_level: interactionLevel,
    total_sessions: totalSessions,
    total_reports: totalReports,
    recent_session_count: recentSessions,
  };
}

// --- Settings ---

export function getApiProxyUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('coassure_api_proxy_url') || null;
}

export function setApiProxyUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('coassure_api_proxy_url', url);
}

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('coassure_api_key') || null;
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('coassure_api_key', key);
}
