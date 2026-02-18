export interface Organisation {
  id: string;
  name: string;
  created_at: string;
}

export interface Worker {
  id: string;
  org_id: string | null;
  name: string;
  trade: string | null;
  years_experience: number;
  years_with_company: number;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface TrainingRecord {
  id: string;
  worker_id: string;
  cert_type: string;
  cert_name: string;
  issued_date: string | null;
  expiry_date: string | null;
  issuer: string | null;
  status: 'current' | 'expiring' | 'expired';
  created_at: string;
}

export interface Session {
  id: string;
  worker_id: string;
  session_type: 'pre-start' | 'toolbox-talk' | 'form-assist' | 'report' | 'reflection';
  status: 'active' | 'completed' | 'abandoned';
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  weather_temp: number | null;
  weather_conditions: string | null;
  weather_wind_speed: number | null;
  weather_wind_dir: string | null;
  task_description: string | null;
  hazards_identified: string | null;
  controls_confirmed: string | null;
  ai_prompts: string | null;
  transcript: string | null;
  summary: string | null;
  duration_seconds: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface Report {
  id: string;
  worker_id: string;
  session_id: string | null;
  report_type: 'near-miss' | 'hazard' | 'good-catch' | 'observation';
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  description: string;
  contributing_factors: string | null;
  actions_taken: string | null;
  recommended_actions: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  photo_path: string | null;
  is_anonymous: boolean;
  status: 'open' | 'reviewed' | 'actioned' | 'closed';
  created_at: string;
}

export interface ConversationMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface WeatherData {
  temp: number;
  conditions: string;
  wind_speed: number;
  wind_dir: string;
  humidity: number;
  uv_index: number;
}

export interface WorkerProfile extends Worker {
  training_records: TrainingRecord[];
  safety_score: number;
  interaction_level: 'peer' | 'standard' | 'supportive';
  total_sessions: number;
  total_reports: number;
  recent_session_count: number;
}

export type SessionType = Session['session_type'];
export type ReportType = Report['report_type'];
