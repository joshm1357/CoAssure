import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'coassure.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organisations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      name TEXT NOT NULL,
      trade TEXT,
      years_experience INTEGER DEFAULT 0,
      years_with_company INTEGER DEFAULT 0,
      email TEXT,
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (org_id) REFERENCES organisations(id)
    );

    CREATE TABLE IF NOT EXISTS training_records (
      id TEXT PRIMARY KEY,
      worker_id TEXT NOT NULL,
      cert_type TEXT NOT NULL,
      cert_name TEXT NOT NULL,
      issued_date TEXT,
      expiry_date TEXT,
      issuer TEXT,
      status TEXT NOT NULL DEFAULT 'current',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      worker_id TEXT NOT NULL,
      session_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      location_lat REAL,
      location_lng REAL,
      location_address TEXT,
      weather_temp REAL,
      weather_conditions TEXT,
      weather_wind_speed REAL,
      weather_wind_dir TEXT,
      task_description TEXT,
      hazards_identified TEXT,
      controls_confirmed TEXT,
      ai_prompts TEXT,
      transcript TEXT,
      summary TEXT,
      duration_seconds INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      worker_id TEXT NOT NULL,
      session_id TEXT,
      report_type TEXT NOT NULL,
      severity TEXT,
      description TEXT NOT NULL,
      contributing_factors TEXT,
      actions_taken TEXT,
      recommended_actions TEXT,
      location_lat REAL,
      location_lng REAL,
      location_address TEXT,
      photo_path TEXT,
      is_anonymous INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (worker_id) REFERENCES workers(id),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS conversation_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `);
}
