import { getDb } from './db';
import { Worker, TrainingRecord, WorkerProfile } from './types';
import { v4 as uuid } from 'uuid';

export function getWorkerProfile(workerId: string): WorkerProfile | null {
  const db = getDb();

  const worker = db.prepare('SELECT * FROM workers WHERE id = ?').get(workerId) as Worker | undefined;
  if (!worker) return null;

  const training = db.prepare(
    'SELECT * FROM training_records WHERE worker_id = ? ORDER BY expiry_date DESC'
  ).all(workerId) as TrainingRecord[];

  const sessionStats = db.prepare(
    'SELECT COUNT(*) as total FROM sessions WHERE worker_id = ?'
  ).get(workerId) as { total: number };

  const recentSessions = db.prepare(
    "SELECT COUNT(*) as total FROM sessions WHERE worker_id = ? AND created_at > datetime('now', '-30 days')"
  ).get(workerId) as { total: number };

  const reportStats = db.prepare(
    'SELECT COUNT(*) as total FROM reports WHERE worker_id = ?'
  ).get(workerId) as { total: number };

  // Update training statuses based on dates
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const record of training) {
    if (record.expiry_date) {
      const expiry = new Date(record.expiry_date);
      if (expiry < now) {
        record.status = 'expired';
      } else if (expiry < thirtyDays) {
        record.status = 'expiring';
      } else {
        record.status = 'current';
      }
      db.prepare('UPDATE training_records SET status = ? WHERE id = ?').run(record.status, record.id);
    }
  }

  const safetyScore = calculateSafetyScore(worker, training, sessionStats.total, reportStats.total, recentSessions.total);
  const interactionLevel = determineInteractionLevel(worker, training, safetyScore);

  return {
    ...worker,
    training_records: training,
    safety_score: safetyScore,
    interaction_level: interactionLevel,
    total_sessions: sessionStats.total,
    total_reports: reportStats.total,
    recent_session_count: recentSessions.total,
  };
}

function calculateSafetyScore(
  worker: Worker,
  training: TrainingRecord[],
  totalSessions: number,
  totalReports: number,
  recentSessions: number
): number {
  let score = 50; // Base score

  // Experience contribution (up to +15)
  score += Math.min(worker.years_experience * 1.5, 15);

  // Training currency (up to +20)
  const currentTraining = training.filter(t => t.status === 'current').length;
  const totalTraining = training.length;
  if (totalTraining > 0) {
    score += (currentTraining / totalTraining) * 20;
  }

  // Session engagement (up to +10) — based on recent activity
  score += Math.min(recentSessions * 2, 10);

  // Reporting engagement (up to +5) — filing reports shows safety awareness
  score += Math.min(totalReports, 5);

  return Math.min(Math.round(score), 100);
}

function determineInteractionLevel(
  worker: Worker,
  training: TrainingRecord[],
  safetyScore: number
): 'peer' | 'standard' | 'supportive' {
  // Experienced workers with current training and good scores get peer-level interaction
  // This means brief, direct prompts — no hand-holding
  if (worker.years_experience >= 10 && safetyScore >= 75) {
    return 'peer';
  }

  // Workers with moderate experience or good scores get standard interaction
  if (worker.years_experience >= 3 || safetyScore >= 60) {
    return 'standard';
  }

  // Newer workers or those with low engagement get supportive interaction
  // More explanation, more guidance, still respectful
  return 'supportive';
}

export function createWorker(data: {
  name: string;
  trade?: string;
  years_experience?: number;
  years_with_company?: number;
  email?: string;
  phone?: string;
  org_id?: string;
}): Worker {
  const db = getDb();
  const id = uuid();

  db.prepare(`
    INSERT INTO workers (id, name, trade, years_experience, years_with_company, email, phone, org_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.trade || null,
    data.years_experience || 0,
    data.years_with_company || 0,
    data.email || null,
    data.phone || null,
    data.org_id || null
  );

  return db.prepare('SELECT * FROM workers WHERE id = ?').get(id) as Worker;
}

export function updateWorker(id: string, data: Partial<Omit<Worker, 'id' | 'created_at'>>): Worker | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM workers WHERE id = ?').get(id) as Worker | undefined;
  if (!existing) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE workers SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  return db.prepare('SELECT * FROM workers WHERE id = ?').get(id) as Worker;
}

export function addTrainingRecord(data: {
  worker_id: string;
  cert_type: string;
  cert_name: string;
  issued_date?: string;
  expiry_date?: string;
  issuer?: string;
}): TrainingRecord {
  const db = getDb();
  const id = uuid();

  let status: 'current' | 'expiring' | 'expired' = 'current';
  if (data.expiry_date) {
    const expiry = new Date(data.expiry_date);
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (expiry < now) status = 'expired';
    else if (expiry < thirtyDays) status = 'expiring';
  }

  db.prepare(`
    INSERT INTO training_records (id, worker_id, cert_type, cert_name, issued_date, expiry_date, issuer, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.worker_id, data.cert_type, data.cert_name, data.issued_date || null, data.expiry_date || null, data.issuer || null, status);

  return db.prepare('SELECT * FROM training_records WHERE id = ?').get(id) as TrainingRecord;
}

export function deleteTrainingRecord(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM training_records WHERE id = ?').run(id);
  return result.changes > 0;
}

export function listWorkers(orgId?: string): Worker[] {
  const db = getDb();
  if (orgId) {
    return db.prepare('SELECT * FROM workers WHERE org_id = ? ORDER BY name').all(orgId) as Worker[];
  }
  return db.prepare('SELECT * FROM workers ORDER BY name').all() as Worker[];
}
