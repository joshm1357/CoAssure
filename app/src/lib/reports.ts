import { getDb } from './db';
import { Report } from './types';
import { v4 as uuid } from 'uuid';

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
  photo_path?: string;
  is_anonymous?: boolean;
}): Report {
  const db = getDb();
  const id = uuid();

  db.prepare(`
    INSERT INTO reports (id, worker_id, session_id, report_type, severity, description,
      contributing_factors, actions_taken, recommended_actions,
      location_lat, location_lng, location_address, photo_path, is_anonymous)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.worker_id,
    data.session_id || null,
    data.report_type,
    data.severity || null,
    data.description,
    data.contributing_factors || null,
    data.actions_taken || null,
    data.recommended_actions || null,
    data.location_lat || null,
    data.location_lng || null,
    data.location_address || null,
    data.photo_path || null,
    data.is_anonymous ? 1 : 0
  );

  return db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as Report;
}

export function getReport(id: string): Report | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as Report) || null;
}

export function listReports(filters?: {
  worker_id?: string;
  report_type?: string;
  status?: string;
  limit?: number;
}): Report[] {
  const db = getDb();
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters?.worker_id) {
    conditions.push('worker_id = ?');
    values.push(filters.worker_id);
  }
  if (filters?.report_type) {
    conditions.push('report_type = ?');
    values.push(filters.report_type);
  }
  if (filters?.status) {
    conditions.push('status = ?');
    values.push(filters.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters?.limit ? `LIMIT ${filters.limit}` : '';

  return db.prepare(
    `SELECT * FROM reports ${where} ORDER BY created_at DESC ${limit}`
  ).all(...values) as Report[];
}

export function updateReportStatus(id: string, status: Report['status']): Report | null {
  const db = getDb();
  const result = db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, id);
  if (result.changes === 0) return null;
  return db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as Report;
}
