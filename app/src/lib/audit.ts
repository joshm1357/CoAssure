// Compliance & audit layer for Australian WHS (Work Health Safety) requirements
// Provides immutable audit trail, data retention enforcement, and privacy data export.
//
// References:
//   - WHS Act 2011 (Cth), s.274: Record-keeping for notifiable incidents (5 years)
//   - WHS Regulations 2011, r.38: Health monitoring records (30 years)
//   - WHS Regulations 2011, r.299-303: SWMS retention
//   - Privacy Act 1988 (Cth), APP 12: Right to access personal data
//   - Privacy Act 1988 (Cth), APP 13: Right to correction / deletion

import { isSupabaseConfigured, getSupabaseClient } from './supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'sign'
  | 'complete';

export type EntityType =
  | 'session'
  | 'report'
  | 'form_submission'
  | 'worker'
  | 'template'
  | 'training_record';

export interface AuditEvent {
  user_id: string;
  org_id?: string;
  action: AuditAction;
  entity_type: EntityType;
  entity_id: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogEntry extends AuditEvent {
  id: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AuditLogFilters {
  entity_type?: EntityType;
  entity_id?: string;
  user_id?: string;
  org_id?: string;
  action?: AuditAction;
  from?: string; // ISO date string
  to?: string;   // ISO date string
  limit?: number;
  offset?: number;
}

export interface RetentionPolicy {
  entity_type: string;
  retention_years: number;
  legal_basis: string;
}

export interface DataExport {
  exported_at: string;
  user_id: string;
  sessions: unknown[];
  reports: unknown[];
  training_records: unknown[];
  form_submissions: unknown[];
  audit_log: AuditLogEntry[];
  worker_profile: unknown | null;
}

export interface DeletionRequest {
  id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'partially_completed' | 'completed' | 'rejected';
  retention_locks: RetentionLock[];
  completed_at: string | null;
}

interface RetentionLock {
  entity_type: EntityType;
  entity_id: string;
  locked_until: string; // ISO date
  reason: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = 'coassure_';
const AUDIT_LOG_KEY = `${STORAGE_PREFIX}audit_log`;
const DELETION_REQUESTS_KEY = `${STORAGE_PREFIX}deletion_requests`;

function genId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getLocalCollection<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCollection<T>(key: string, data: T[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Reads a localStorage collection stored under the standard coassure_ prefix,
 * matching the pattern used in client-db.ts.
 */
function getClientDbCollection<T>(collectionName: string): T[] {
  return getLocalCollection<T>(`${STORAGE_PREFIX}${collectionName}`);
}

// ---------------------------------------------------------------------------
// 1. Audit event logging
// ---------------------------------------------------------------------------

/**
 * Logs an action to the immutable audit trail.
 *
 * In local mode (no Supabase), entries are appended to localStorage.
 * When Supabase is configured, entries are inserted into the `audit_log` table.
 *
 * The function is intentionally fire-and-forget safe: callers can await it for
 * confirmation, but failures are logged to the console rather than thrown so
 * that audit logging never blocks the primary user action.
 */
export async function logAuditEvent(event: AuditEvent): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: genId(),
    ...event,
    timestamp: now(),
    user_agent: isBrowser() ? navigator.userAgent : undefined,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('audit_log').insert({
        id: entry.id,
        user_id: entry.user_id,
        org_id: entry.org_id || null,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        metadata: entry.metadata || null,
        timestamp: entry.timestamp,
        user_agent: entry.user_agent || null,
      });

      if (error) {
        console.error('[audit] Failed to write audit log to Supabase:', error.message);
        // Fall through to local storage as backup
        appendToLocalLog(entry);
      }
    } catch (err) {
      console.error('[audit] Supabase audit log error:', err);
      appendToLocalLog(entry);
    }
  } else {
    appendToLocalLog(entry);
  }

  return entry;
}

function appendToLocalLog(entry: AuditLogEntry): void {
  const log = getLocalCollection<AuditLogEntry>(AUDIT_LOG_KEY);
  log.push(entry);
  setLocalCollection(AUDIT_LOG_KEY, log);
}

// ---------------------------------------------------------------------------
// 2. Audit log retrieval
// ---------------------------------------------------------------------------

/**
 * Retrieves audit log entries with optional filters.
 * Supports filtering by entity_type, entity_id, user_id, org_id, action,
 * date range (from/to), and pagination (limit/offset).
 */
export async function getAuditLog(
  filters: AuditLogFilters = {}
): Promise<AuditLogEntry[]> {
  if (isSupabaseConfigured()) {
    return getAuditLogFromSupabase(filters);
  }
  return getAuditLogFromLocal(filters);
}

async function getAuditLogFromSupabase(
  filters: AuditLogFilters
): Promise<AuditLogEntry[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('timestamp', { ascending: false });

  if (filters.entity_type) {
    query = query.eq('entity_type', filters.entity_type);
  }
  if (filters.entity_id) {
    query = query.eq('entity_id', filters.entity_id);
  }
  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters.org_id) {
    query = query.eq('org_id', filters.org_id);
  }
  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  if (filters.from) {
    query = query.gte('timestamp', filters.from);
  }
  if (filters.to) {
    query = query.lte('timestamp', filters.to);
  }

  const limit = filters.limit ?? 100;
  const offset = filters.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('[audit] Failed to read audit log from Supabase:', error.message);
    return [];
  }

  return (data || []) as AuditLogEntry[];
}

function getAuditLogFromLocal(filters: AuditLogFilters): AuditLogEntry[] {
  let entries = getLocalCollection<AuditLogEntry>(AUDIT_LOG_KEY);

  // Apply filters
  if (filters.entity_type) {
    entries = entries.filter((e) => e.entity_type === filters.entity_type);
  }
  if (filters.entity_id) {
    entries = entries.filter((e) => e.entity_id === filters.entity_id);
  }
  if (filters.user_id) {
    entries = entries.filter((e) => e.user_id === filters.user_id);
  }
  if (filters.org_id) {
    entries = entries.filter((e) => e.org_id === filters.org_id);
  }
  if (filters.action) {
    entries = entries.filter((e) => e.action === filters.action);
  }
  if (filters.from) {
    const from = filters.from;
    entries = entries.filter((e) => e.timestamp >= from);
  }
  if (filters.to) {
    const to = filters.to;
    entries = entries.filter((e) => e.timestamp <= to);
  }

  // Sort descending by timestamp
  entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Pagination
  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 100;
  return entries.slice(offset, offset + limit);
}

// ---------------------------------------------------------------------------
// 3. Data retention helpers (Australian WHS law)
// ---------------------------------------------------------------------------

/**
 * Australian WHS data retention periods.
 *
 * These are minimum retention periods required by law. Records MUST NOT
 * be deleted before these periods expire.
 */
const RETENTION_POLICIES: Record<string, RetentionPolicy> = {
  // WHS Act 2011 s.274 - Notifiable incidents
  notifiable_incident: {
    entity_type: 'notifiable_incident',
    retention_years: 5,
    legal_basis: 'WHS Act 2011 (Cth), s.274 - Notifiable incident records',
  },
  // WHS Regulations 2011 r.299-303 - Safe Work Method Statements
  // 2 years after work completed, or 5 years if associated with an incident
  form_submission: {
    entity_type: 'form_submission',
    retention_years: 2,
    legal_basis: 'WHS Regulations 2011 (Cth), r.299-303 - SWMS/form retention (2 years after work completion; 5 years if linked to incident)',
  },
  // WHS Regulations 2011 r.38 - Health monitoring
  health_monitoring: {
    entity_type: 'health_monitoring',
    retention_years: 30,
    legal_basis: 'WHS Regulations 2011 (Cth), r.38 - Health monitoring records (30 years from date of record)',
  },
  // General best practice for training/competency
  training_record: {
    entity_type: 'training_record',
    retention_years: 7,
    legal_basis: 'WHS Regulations 2011 (Cth), r.39 & ATO record requirements - Training and competency records',
  },
  // General safety records
  worker: {
    entity_type: 'worker',
    retention_years: 5,
    legal_basis: 'WHS Act 2011 (Cth) - General safety records for duty of care compliance',
  },
  report: {
    entity_type: 'report',
    retention_years: 5,
    legal_basis: 'WHS Act 2011 (Cth), s.274 - Incident and hazard reports',
  },
  template: {
    entity_type: 'template',
    retention_years: 5,
    legal_basis: 'WHS Act 2011 (Cth) - General safety records',
  },
  session: {
    entity_type: 'session',
    retention_years: 2,
    legal_basis: 'WHS Regulations 2011 (Cth) - Pre-start and toolbox talk session records',
  },
};

/**
 * Returns the minimum retention period in years for the given entity type,
 * based on Australian WHS legislation.
 */
export function getRetentionPolicy(entityType: string): RetentionPolicy {
  const policy = RETENTION_POLICIES[entityType];
  if (policy) return policy;

  // Default: 5 years for any unrecognised safety-related entity type
  return {
    entity_type: entityType,
    retention_years: 5,
    legal_basis: 'WHS Act 2011 (Cth) - General safety records (default policy)',
  };
}

/**
 * Returns whether a record is currently locked by retention requirements
 * and cannot be deleted.
 *
 * @param entity - Must include `entity_type` (EntityType) and `created_at` (ISO string).
 *                 Optionally include `completed_at` for session/form types where
 *                 retention starts from completion rather than creation.
 */
export function isRetentionLocked(entity: {
  entity_type: EntityType;
  created_at: string;
  completed_at?: string | null;
}): boolean {
  return !canDeleteEntity(
    entity.entity_type,
    entity.created_at,
    entity.completed_at ?? undefined
  );
}

/**
 * Returns whether enough time has passed for an entity to be eligible for
 * deletion, based on its type and the applicable WHS retention period.
 *
 * For sessions and form_submissions, the retention period starts from
 * `completedAt` (if provided) rather than `createdAt`, since WHS requires
 * retention "after work completion".
 *
 * @param entityType  - The type of entity
 * @param createdAt   - ISO date string when the entity was created
 * @param completedAt - Optional ISO date string when work was completed
 */
export function canDeleteEntity(
  entityType: EntityType,
  createdAt: string,
  completedAt?: string
): boolean {
  const policy = getRetentionPolicy(entityType);

  // For sessions and form submissions, retention starts from completion date
  // (i.e. "after work completion"), falling back to creation date
  const retentionStart =
    (entityType === 'session' || entityType === 'form_submission') && completedAt
      ? completedAt
      : createdAt;

  const retentionStartDate = new Date(retentionStart);
  const retentionEndDate = new Date(retentionStartDate);
  retentionEndDate.setFullYear(
    retentionEndDate.getFullYear() + policy.retention_years
  );

  return new Date() >= retentionEndDate;
}

// ---------------------------------------------------------------------------
// 4. Privacy / data export (Privacy Act 1988 compliance)
// ---------------------------------------------------------------------------

/**
 * Generates a JSON export of all data associated with a user.
 *
 * This satisfies the Australian Privacy Act 1988 (APP 12) requirement
 * to provide individuals with access to their personal information
 * upon request.
 *
 * In local mode, data is gathered from localStorage collections.
 * In Supabase mode, data is queried from the database.
 */
export async function exportUserData(userId: string): Promise<DataExport> {
  const exportData: DataExport = {
    exported_at: now(),
    user_id: userId,
    sessions: [],
    reports: [],
    training_records: [],
    form_submissions: [],
    audit_log: [],
    worker_profile: null,
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();

    // Fetch all user-related data in parallel
    const [
      sessionsResult,
      reportsResult,
      trainingResult,
      formSubmissionsResult,
      auditResult,
      workerResult,
    ] = await Promise.all([
      supabase.from('sessions').select('*').eq('worker_id', userId),
      supabase.from('reports').select('*').eq('worker_id', userId),
      supabase.from('training_records').select('*').eq('worker_id', userId),
      supabase.from('form_submissions').select('*').eq('user_id', userId),
      supabase.from('audit_log').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
      supabase.from('workers').select('*').eq('id', userId).maybeSingle(),
    ]);

    exportData.sessions = sessionsResult.data || [];
    exportData.reports = reportsResult.data || [];
    exportData.training_records = trainingResult.data || [];
    exportData.form_submissions = formSubmissionsResult.data || [];
    exportData.audit_log = (auditResult.data || []) as AuditLogEntry[];
    exportData.worker_profile = workerResult.data || null;
  } else {
    // Local mode: pull from localStorage collections used by client-db.ts
    type LocalSession = { worker_id: string };
    type LocalReport = { worker_id: string };
    type LocalTraining = { worker_id: string };
    type LocalFormSub = { user_id?: string; worker_id?: string };

    const allSessions = getClientDbCollection<LocalSession>('sessions');
    const allReports = getClientDbCollection<LocalReport>('reports');
    const allTraining = getClientDbCollection<LocalTraining>('training');
    const allFormSubmissions = getClientDbCollection<LocalFormSub>('form_submissions');
    const allAuditEntries = getLocalCollection<AuditLogEntry>(AUDIT_LOG_KEY);

    exportData.sessions = allSessions.filter(
      (s) => s.worker_id === userId
    );
    exportData.reports = allReports.filter(
      (r) => r.worker_id === userId
    );
    exportData.training_records = allTraining.filter(
      (t) => t.worker_id === userId
    );
    exportData.form_submissions = allFormSubmissions.filter(
      (f) => f.user_id === userId || f.worker_id === userId
    );
    exportData.audit_log = allAuditEntries.filter(
      (e) => e.user_id === userId
    );

    type LocalWorker = { id: string };
    const allWorkers = getClientDbCollection<LocalWorker>('workers');
    exportData.worker_profile =
      allWorkers.find((w) => w.id === userId) || null;
  }

  // Log the export action itself
  await logAuditEvent({
    user_id: userId,
    action: 'export',
    entity_type: 'worker',
    entity_id: userId,
    metadata: { export_type: 'full_user_data', privacy_act: 'APP_12' },
  });

  return exportData;
}

/**
 * Marks user data for deletion, respecting WHS retention locks.
 *
 * Under the Australian Privacy Act 1988 (APP 13), individuals can request
 * deletion of their personal information. However, WHS legislation overrides
 * this for safety-critical records that must be retained for specified periods.
 *
 * This function:
 *  1. Identifies all entities owned by the user
 *  2. Checks each entity against retention requirements
 *  3. Immediately deletes entities that are past their retention period
 *  4. Creates retention locks for entities that cannot yet be deleted
 *  5. Returns a DeletionRequest summarising what was done
 */
export async function requestDataDeletion(
  userId: string
): Promise<DeletionRequest> {
  const retentionLocks: RetentionLock[] = [];
  let hasLockedEntities = false;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();

    // Check each entity type for retention locks
    const entityQueries: { type: EntityType; table: string; idField: string }[] = [
      { type: 'session', table: 'sessions', idField: 'worker_id' },
      { type: 'report', table: 'reports', idField: 'worker_id' },
      { type: 'training_record', table: 'training_records', idField: 'worker_id' },
      { type: 'form_submission', table: 'form_submissions', idField: 'user_id' },
    ];

    for (const { type, table, idField } of entityQueries) {
      const { data: entities } = await supabase
        .from(table)
        .select('id, created_at, completed_at')
        .eq(idField, userId);

      if (!entities) continue;

      for (const entity of entities) {
        const completedAt = (entity as Record<string, unknown>).completed_at as string | undefined;
        if (!canDeleteEntity(type, entity.created_at, completedAt ?? undefined)) {
          hasLockedEntities = true;
          const policy = getRetentionPolicy(type);
          const startDate = new Date(completedAt || entity.created_at);
          const lockUntil = new Date(startDate);
          lockUntil.setFullYear(lockUntil.getFullYear() + policy.retention_years);

          retentionLocks.push({
            entity_type: type,
            entity_id: entity.id,
            locked_until: lockUntil.toISOString(),
            reason: policy.legal_basis,
          });
        } else {
          // Entity is past retention: mark as deleted / anonymise
          await supabase.from(table).delete().eq('id', entity.id);
        }
      }
    }

    // Anonymise the worker profile (keep the record shell for referential integrity
    // but strip personal data)
    await supabase
      .from('workers')
      .update({
        name: '[Deleted User]',
        email: null,
        phone: null,
      })
      .eq('id', userId);

  } else {
    // Local mode
    const entityCollections: {
      type: EntityType;
      key: string;
      idField: string;
    }[] = [
      { type: 'session', key: 'sessions', idField: 'worker_id' },
      { type: 'report', key: 'reports', idField: 'worker_id' },
      { type: 'training_record', key: 'training', idField: 'worker_id' },
      { type: 'form_submission', key: 'form_submissions', idField: 'user_id' },
    ];

    for (const { type, key, idField } of entityCollections) {
      type Entity = Record<string, unknown>;
      const all = getClientDbCollection<Entity>(key);
      const kept: Entity[] = [];

      for (const entity of all) {
        if (entity[idField] !== userId) {
          kept.push(entity);
          continue;
        }

        const createdAt = entity.created_at as string;
        const completedAt = entity.completed_at as string | undefined;

        if (!canDeleteEntity(type, createdAt, completedAt)) {
          hasLockedEntities = true;
          const policy = getRetentionPolicy(type);
          const startDate = new Date(completedAt || createdAt);
          const lockUntil = new Date(startDate);
          lockUntil.setFullYear(lockUntil.getFullYear() + policy.retention_years);

          retentionLocks.push({
            entity_type: type,
            entity_id: entity.id as string,
            locked_until: lockUntil.toISOString(),
            reason: policy.legal_basis,
          });
          kept.push(entity); // Keep the locked entity
        }
        // Else: entity is past retention, omit it (effectively delete)
      }

      setLocalCollection(`${STORAGE_PREFIX}${key}`, kept);
    }

    // Anonymise worker profile locally
    type LocalWorker = { id: string; name: string; email: string | null; phone: string | null };
    const workers = getClientDbCollection<LocalWorker>('workers');
    const workerIdx = workers.findIndex((w) => w.id === userId);
    if (workerIdx !== -1) {
      workers[workerIdx] = {
        ...workers[workerIdx],
        name: '[Deleted User]',
        email: null,
        phone: null,
      };
      setLocalCollection(`${STORAGE_PREFIX}workers`, workers);
    }
  }

  const deletionRequest: DeletionRequest = {
    id: genId(),
    user_id: userId,
    requested_at: now(),
    status: hasLockedEntities ? 'partially_completed' : 'completed',
    retention_locks: retentionLocks,
    completed_at: hasLockedEntities ? null : now(),
  };

  // Persist the deletion request
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('deletion_requests').insert(deletionRequest);
    } catch (err) {
      console.error('[audit] Failed to persist deletion request to Supabase:', err);
    }
  } else {
    const requests = getLocalCollection<DeletionRequest>(DELETION_REQUESTS_KEY);
    requests.push(deletionRequest);
    setLocalCollection(DELETION_REQUESTS_KEY, requests);
  }

  // Log the deletion request
  await logAuditEvent({
    user_id: userId,
    action: 'delete',
    entity_type: 'worker',
    entity_id: userId,
    metadata: {
      deletion_request_id: deletionRequest.id,
      retention_locks_count: retentionLocks.length,
      status: deletionRequest.status,
      privacy_act: 'APP_13',
    },
  });

  return deletionRequest;
}
