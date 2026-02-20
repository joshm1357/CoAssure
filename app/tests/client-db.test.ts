import { describe, it, expect, beforeEach } from 'vitest';
import {
  createWorker,
  getWorker,
  updateWorker,
  addTrainingRecord,
  getTrainingRecords,
  deleteTrainingRecord,
  createSession,
  getSession,
  completeSession,
  countSessions,
  countRecentSessions,
  addMessage,
  getMessages,
  createReport,
  countReports,
  getRecentReports,
  getRecentSessions,
  getSessions,
  getReports,
  getWorkerProfile,
} from '@/lib/client-db';

describe('Workers', () => {
  it('creates a worker with correct fields', () => {
    const worker = createWorker({ name: 'Dave Mitchell', trade: 'Electrician', years_experience: 12 });
    expect(worker.name).toBe('Dave Mitchell');
    expect(worker.trade).toBe('Electrician');
    expect(worker.years_experience).toBe(12);
    expect(worker.id).toBeTruthy();
    expect(worker.created_at).toBeTruthy();
  });

  it('retrieves a worker by ID', () => {
    const created = createWorker({ name: 'Sarah Chen' });
    const retrieved = getWorker(created.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('Sarah Chen');
  });

  it('returns null for non-existent worker', () => {
    expect(getWorker('non-existent-id')).toBeNull();
  });

  it('updates a worker', () => {
    const worker = createWorker({ name: 'Mike Petrov', trade: 'Plumber' });
    const updated = updateWorker(worker.id, { trade: 'Electrician', years_experience: 5 });
    expect(updated).not.toBeNull();
    expect(updated!.trade).toBe('Electrician');
    expect(updated!.years_experience).toBe(5);
    expect(updated!.name).toBe('Mike Petrov'); // Unchanged
  });

  it('returns null when updating non-existent worker', () => {
    expect(updateWorker('fake-id', { name: 'Nobody' })).toBeNull();
  });
});

describe('Training Records', () => {
  let workerId: string;

  beforeEach(() => {
    const worker = createWorker({ name: 'Test Worker' });
    workerId = worker.id;
  });

  it('adds a training record with current status', () => {
    const futureDate = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    const record = addTrainingRecord({
      worker_id: workerId,
      cert_type: 'White Card',
      cert_name: 'White Card',
      expiry_date: futureDate,
    });
    expect(record.status).toBe('current');
    expect(record.cert_type).toBe('White Card');
  });

  it('marks expired certs correctly', () => {
    const pastDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const record = addTrainingRecord({
      worker_id: workerId,
      cert_type: 'First Aid',
      cert_name: 'First Aid',
      expiry_date: pastDate,
    });
    expect(record.status).toBe('expired');
  });

  it('marks expiring certs correctly', () => {
    const soonDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const record = addTrainingRecord({
      worker_id: workerId,
      cert_type: 'Working at Heights',
      cert_name: 'Working at Heights',
      expiry_date: soonDate,
    });
    expect(record.status).toBe('expiring');
  });

  it('retrieves records for a worker', () => {
    addTrainingRecord({ worker_id: workerId, cert_type: 'A', cert_name: 'Cert A' });
    addTrainingRecord({ worker_id: workerId, cert_type: 'B', cert_name: 'Cert B' });
    const records = getTrainingRecords(workerId);
    expect(records).toHaveLength(2);
  });

  it('deletes a training record', () => {
    const record = addTrainingRecord({ worker_id: workerId, cert_type: 'Temp', cert_name: 'Temp' });
    expect(deleteTrainingRecord(record.id)).toBe(true);
    expect(getTrainingRecords(workerId)).toHaveLength(0);
  });

  it('returns false when deleting non-existent record', () => {
    expect(deleteTrainingRecord('fake-id')).toBe(false);
  });
});

describe('Sessions', () => {
  let workerId: string;

  beforeEach(() => {
    const worker = createWorker({ name: 'Test Worker' });
    workerId = worker.id;
  });

  it('creates a session', () => {
    const session = createSession({ worker_id: workerId, session_type: 'pre-start' });
    expect(session.session_type).toBe('pre-start');
    expect(session.status).toBe('active');
    expect(session.worker_id).toBe(workerId);
  });

  it('creates session with weather data', () => {
    const session = createSession({
      worker_id: workerId,
      session_type: 'toolbox-talk',
      weather_temp: 28,
      weather_conditions: 'Sunny',
      weather_wind_speed: 15,
      weather_wind_dir: 'NE',
    });
    expect(session.weather_temp).toBe(28);
    expect(session.weather_conditions).toBe('Sunny');
  });

  it('retrieves a session', () => {
    const created = createSession({ worker_id: workerId, session_type: 'form-assist' });
    const retrieved = getSession(created.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.session_type).toBe('form-assist');
  });

  it('completes a session', () => {
    const session = createSession({ worker_id: workerId, session_type: 'reflection' });
    const completed = completeSession(session.id, 'Test summary', 'Test transcript');
    expect(completed).not.toBeNull();
    expect(completed!.status).toBe('completed');
    expect(completed!.summary).toBe('Test summary');
    expect(completed!.completed_at).toBeTruthy();
  });

  it('counts sessions correctly', () => {
    createSession({ worker_id: workerId, session_type: 'pre-start' });
    createSession({ worker_id: workerId, session_type: 'toolbox-talk' });
    expect(countSessions(workerId)).toBe(2);
  });

  it('counts recent sessions', () => {
    createSession({ worker_id: workerId, session_type: 'pre-start' });
    expect(countRecentSessions(workerId)).toBe(1);
  });

  it('gets sessions sorted by date', () => {
    createSession({ worker_id: workerId, session_type: 'pre-start' });
    createSession({ worker_id: workerId, session_type: 'toolbox-talk' });
    const sessions = getSessions(workerId);
    expect(sessions).toHaveLength(2);
    // Most recent first
    expect(new Date(sessions[0].created_at).getTime()).toBeGreaterThanOrEqual(new Date(sessions[1].created_at).getTime());
  });

  it('gets recent sessions with limit', () => {
    createSession({ worker_id: workerId, session_type: 'pre-start' });
    createSession({ worker_id: workerId, session_type: 'toolbox-talk' });
    createSession({ worker_id: workerId, session_type: 'form-assist' });
    const recent = getRecentSessions(workerId, 2);
    expect(recent).toHaveLength(2);
  });
});

describe('Messages', () => {
  it('adds and retrieves messages', () => {
    const session = createSession({ worker_id: createWorker({ name: 'Test' }).id, session_type: 'pre-start' });
    addMessage(session.id, 'user', 'Hello');
    addMessage(session.id, 'assistant', 'G\'day');
    const messages = getMessages(session.id);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('assistant');
  });

  it('returns messages in chronological order', () => {
    const session = createSession({ worker_id: createWorker({ name: 'Test' }).id, session_type: 'pre-start' });
    addMessage(session.id, 'user', 'First');
    addMessage(session.id, 'assistant', 'Second');
    addMessage(session.id, 'user', 'Third');
    const messages = getMessages(session.id);
    expect(messages[0].content).toBe('First');
    expect(messages[2].content).toBe('Third');
  });
});

describe('Reports', () => {
  let workerId: string;

  beforeEach(() => {
    const worker = createWorker({ name: 'Test Worker' });
    workerId = worker.id;
  });

  it('creates a report', () => {
    const report = createReport({
      worker_id: workerId,
      report_type: 'near-miss',
      severity: 'high',
      description: 'Scaffold plank shifted',
    });
    expect(report.report_type).toBe('near-miss');
    expect(report.severity).toBe('high');
    expect(report.status).toBe('open');
  });

  it('creates anonymous report', () => {
    const report = createReport({
      worker_id: workerId,
      report_type: 'hazard',
      description: 'Water on floor',
      is_anonymous: true,
    });
    expect(report.is_anonymous).toBe(true);
  });

  it('counts reports for worker', () => {
    createReport({ worker_id: workerId, report_type: 'near-miss', description: 'A' });
    createReport({ worker_id: workerId, report_type: 'hazard', description: 'B' });
    expect(countReports(workerId)).toBe(2);
  });

  it('gets recent reports', () => {
    createReport({ worker_id: workerId, report_type: 'near-miss', description: 'Recent' });
    const recent = getRecentReports(30);
    expect(recent.length).toBeGreaterThanOrEqual(1);
  });

  it('gets reports sorted by date', () => {
    createReport({ worker_id: workerId, report_type: 'near-miss', description: 'First' });
    createReport({ worker_id: workerId, report_type: 'hazard', description: 'Second' });
    const reports = getReports(workerId);
    expect(reports).toHaveLength(2);
    // Most recent first
    expect(new Date(reports[0].created_at).getTime()).toBeGreaterThanOrEqual(new Date(reports[1].created_at).getTime());
  });
});

describe('Worker Profile (computed)', () => {
  it('calculates safety score correctly', () => {
    const worker = createWorker({ name: 'Experienced Worker', years_experience: 10, years_with_company: 5 });
    // Add some training
    const futureDate = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    addTrainingRecord({ worker_id: worker.id, cert_type: 'A', cert_name: 'A', expiry_date: futureDate });
    // Create some sessions and reports
    createSession({ worker_id: worker.id, session_type: 'pre-start' });
    createReport({ worker_id: worker.id, report_type: 'near-miss', description: 'Test' });

    const profile = getWorkerProfile(worker.id);
    expect(profile).not.toBeNull();
    expect(profile!.safety_score).toBeGreaterThan(50);
    expect(profile!.safety_score).toBeLessThanOrEqual(100);
  });

  it('determines peer interaction level for experienced workers', () => {
    const worker = createWorker({ name: 'Expert', years_experience: 15, years_with_company: 8 });
    // Add training to push score up
    const futureDate = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    addTrainingRecord({ worker_id: worker.id, cert_type: 'A', cert_name: 'A', expiry_date: futureDate });
    addTrainingRecord({ worker_id: worker.id, cert_type: 'B', cert_name: 'B', expiry_date: futureDate });

    const profile = getWorkerProfile(worker.id);
    expect(profile).not.toBeNull();
    expect(profile!.interaction_level).toBe('peer');
  });

  it('determines supportive interaction level for new workers', () => {
    const worker = createWorker({ name: 'Newbie', years_experience: 1 });
    const profile = getWorkerProfile(worker.id);
    expect(profile).not.toBeNull();
    expect(profile!.interaction_level).toBe('supportive');
  });

  it('returns null for non-existent worker', () => {
    expect(getWorkerProfile('fake-id')).toBeNull();
  });

  it('includes training records in profile', () => {
    const worker = createWorker({ name: 'Test' });
    addTrainingRecord({ worker_id: worker.id, cert_type: 'White Card', cert_name: 'White Card' });
    const profile = getWorkerProfile(worker.id);
    expect(profile!.training_records).toHaveLength(1);
  });
});
