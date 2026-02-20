// Demo data for testing and sales demo account
// Loads pre-populated sessions, reports, training records, and example transcripts

import { Worker, TrainingRecord, Session, Report, ConversationMessage } from './types';

// --- Demo Worker ---
const DEMO_WORKER: Worker = {
  id: 'demo-worker-001',
  org_id: null,
  name: 'Dave Mitchell',
  trade: 'Electrician',
  years_experience: 12,
  years_with_company: 4,
  email: 'dave.mitchell@example.com',
  phone: '0412 345 678',
  created_at: '2024-06-15T08:00:00.000Z',
};

// --- Demo Training Records ---
const DEMO_TRAINING: TrainingRecord[] = [
  {
    id: 'demo-cert-001',
    worker_id: 'demo-worker-001',
    cert_type: 'Electrical License',
    cert_name: 'Electrical License - Class A',
    issued_date: '2020-03-15',
    expiry_date: '2027-03-15',
    issuer: 'Fair Trading NSW',
    status: 'current',
    created_at: '2024-06-15T08:00:00.000Z',
  },
  {
    id: 'demo-cert-002',
    worker_id: 'demo-worker-001',
    cert_type: 'White Card',
    cert_name: 'White Card (Construction Induction)',
    issued_date: '2012-09-01',
    expiry_date: null,
    issuer: 'SafeWork NSW',
    status: 'current',
    created_at: '2024-06-15T08:00:00.000Z',
  },
  {
    id: 'demo-cert-003',
    worker_id: 'demo-worker-001',
    cert_type: 'First Aid',
    cert_name: 'Provide First Aid (HLTAID011)',
    issued_date: '2023-11-20',
    expiry_date: '2026-11-20',
    issuer: 'St John Ambulance',
    status: 'current',
    created_at: '2024-06-15T08:00:00.000Z',
  },
  {
    id: 'demo-cert-004',
    worker_id: 'demo-worker-001',
    cert_type: 'Working at Heights',
    cert_name: 'Working at Heights',
    issued_date: '2023-02-10',
    expiry_date: '2026-02-10',
    issuer: 'Height Safety Training Pty Ltd',
    status: 'expiring',
    created_at: '2024-06-15T08:00:00.000Z',
  },
  {
    id: 'demo-cert-005',
    worker_id: 'demo-worker-001',
    cert_type: 'EWP',
    cert_name: 'EWP (Boom type over 11m)',
    issued_date: '2022-06-01',
    expiry_date: '2025-06-01',
    issuer: 'TAFE NSW',
    status: 'expired',
    created_at: '2024-06-15T08:00:00.000Z',
  },
];

// --- Demo Sessions with realistic transcripts ---
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

const DEMO_SESSIONS: Session[] = [
  {
    id: 'demo-session-001',
    worker_id: 'demo-worker-001',
    session_type: 'pre-start',
    status: 'completed',
    location_lat: -33.8688,
    location_lng: 151.2093,
    location_address: 'Barangaroo, Sydney',
    weather_temp: 28,
    weather_conditions: 'Partly cloudy',
    weather_wind_speed: 22,
    weather_wind_dir: 'NE',
    task_description: 'Switchboard upgrade Level 3',
    hazards_identified: 'Live electrical work, working at height (access panel above 2m), dust from cutting',
    controls_confirmed: 'Isolation procedure confirmed, EWP pre-start done, dust mask and glasses',
    ai_prompts: null,
    transcript: null,
    summary: `**Task:** Switchboard upgrade on Level 3 — removing old board and installing new 3-phase distribution board.

**Hazards Identified:**
- Live electrical work during changeover period
- Working at height — access panel 2.4m up, using EWP
- Dust from concrete cutting for new cable runs
- Other trades working nearby on Level 3 fitout

**Controls Confirmed:**
- Isolation procedure: Lock-out/tag-out on main supply, verified dead with voltage tester
- EWP pre-start checklist completed, harness checked
- Dust mask (P2) and safety glasses for cutting
- Barricaded work area, signage posted for other trades
- Apprentice briefed on no-go zones

**Actions / Follow-ups:**
- Check with mechanical team re: their schedule on Level 3 this arvo
- EWP licence renewal overdue — book refresher this week

**Weather/Site Notes:**
- 28°C partly cloudy, NE wind 22km/h — fine for outdoor EWP work
- UV moderate — sunscreen applied`,
    duration_seconds: 245,
    created_at: `${today}T06:45:00.000Z`,
    completed_at: `${today}T06:49:05.000Z`,
  },
  {
    id: 'demo-session-002',
    worker_id: 'demo-worker-001',
    session_type: 'toolbox-talk',
    status: 'completed',
    location_lat: -33.8688,
    location_lng: 151.2093,
    location_address: 'Barangaroo, Sydney',
    weather_temp: 31,
    weather_conditions: 'Clear sky',
    weather_wind_speed: 15,
    weather_wind_dir: 'N',
    task_description: null,
    hazards_identified: null,
    controls_confirmed: null,
    ai_prompts: null,
    transcript: null,
    summary: `**Topic:** Heat stress management — 31°C forecast, concrete pour on Level 5 today

**Attendees:** Dave Mitchell, Sarah Chen, Mike Petrov, Jake Williams, Tom Nguyen

**Key Hazards Discussed:**
- Heat exhaustion risk — concrete pour is physically demanding in 31°C
- UV exposure on open Level 5 deck
- Dehydration affecting concentration — knock-on effect on quality and safety
- Reduced grip strength when sweating (handling steel forms)

**Agreed Actions:**
- Mandatory 10-min break every hour in shade
- Water cooler set up on Level 5 before pour starts
- Buddy system — watch each other for heat stress signs (confusion, dizziness, cramps)
- Sunscreen and hats for anyone on the deck
- If anyone feels off, stop work and come down — no questions asked

**Key Points:**
- Jake flagged that last pour in December, they pushed through and one bloke nearly fainted — agreed we won't repeat that
- Sarah suggested staggering the pour so only 3 people on deck at a time — group agreed`,
    duration_seconds: 420,
    created_at: `${yesterday}T06:30:00.000Z`,
    completed_at: `${yesterday}T06:37:00.000Z`,
  },
  {
    id: 'demo-session-003',
    worker_id: 'demo-worker-001',
    session_type: 'reflection',
    status: 'completed',
    location_lat: -33.8688,
    location_lng: 151.2093,
    location_address: 'Barangaroo, Sydney',
    weather_temp: 26,
    weather_conditions: 'Overcast',
    weather_wind_speed: 10,
    weather_wind_dir: 'S',
    task_description: null,
    hazards_identified: null,
    controls_confirmed: null,
    ai_prompts: null,
    transcript: null,
    summary: `**Job Completed:** Level 3 switchboard upgrade — old board removed, new board mounted, main feeds terminated. Still need to complete sub-circuit connections tomorrow.

**What Went Well:**
- Isolation went smoothly, no surprises on the existing wiring
- EWP worked well for the access panel, much safer than the ladder we used last time
- Apprentice (Tom) did well on the cable terminations — he's coming along

**What Was Unexpected:**
- Found asbestos-backed board behind the old switchboard — wasn't in the scope. Had to stop, notify supervisor, and get an assessment. Delayed us about 90 minutes
- The new board mounting brackets didn't align with the existing fixings — had to drill new holes

**Handover Notes (for the next person):**
- Asbestos area is cordoned off and labelled — DO NOT disturb until remediation team clears it (expected Thursday)
- Sub-circuit cables are laid out and labelled but NOT terminated — check labels before connecting
- EWP is still on Level 3 — booked for tomorrow morning, return to yard by 2pm
- Main supply is still isolated and tagged — my lock is on it (Tag #DM-047)

**Reports to File:**
- Near-miss: asbestos discovery — should have been identified in the demolition survey. Filed as observation for site management.`,
    duration_seconds: 310,
    created_at: `${yesterday}T15:30:00.000Z`,
    completed_at: `${yesterday}T15:35:10.000Z`,
  },
  {
    id: 'demo-session-004',
    worker_id: 'demo-worker-001',
    session_type: 'form-assist',
    status: 'completed',
    location_lat: -33.8688,
    location_lng: 151.2093,
    location_address: 'Barangaroo, Sydney',
    weather_temp: 24,
    weather_conditions: 'Light rain',
    weather_wind_speed: 30,
    weather_wind_dir: 'SW',
    task_description: null,
    hazards_identified: null,
    controls_confirmed: null,
    ai_prompts: null,
    transcript: null,
    summary: `**Take 5 — Personal Risk Assessment**
Date: ${twoDaysAgo} | Worker: Dave Mitchell | Location: Barangaroo Level 2

**Task:** Cable tray installation in ceiling void, Level 2 corridor

**Stop & Think:**
- Right tools: Yes — drill, cable tray cutter, ladder, PPE
- Trained: Yes — electrical licence current
- Conditions changed: No
- Others affected: Yes — plasterers working adjacent
- JSA current: Yes — JSA-2024-147
- Fit for work: Yes

**Hazards Identified:**
- Working at height (ladder work in ceiling void, 2.5m)
- Dust from drilling into concrete soffit
- Manual handling — cable tray sections are 3m long
- Electrical — existing services in ceiling void
- Noise from drilling affecting adjacent trades

**Risk Rating:** Possible × Moderate = HIGH (before controls)

**Controls:**
- Ladder inspected, footed by second person when in ceiling void
- P2 dust mask and safety glasses for drilling
- Two-person lift for cable tray sections
- Voltage tester on all existing services before working near them
- Notify plasterers of drilling schedule — agree on timing
- Hearing protection (earmuffs)

**PPE:** Hard hat, safety glasses, P2 dust mask, hi-vis, gloves, steel-cap boots, hearing protection

**Safe to proceed:** Yes

**Signed:** Dave Mitchell, ${twoDaysAgo}`,
    duration_seconds: 180,
    created_at: `${twoDaysAgo}T07:00:00.000Z`,
    completed_at: `${twoDaysAgo}T07:03:00.000Z`,
  },
];

// --- Demo Reports ---
const DEMO_REPORTS: Report[] = [
  {
    id: 'demo-report-001',
    worker_id: 'demo-worker-001',
    session_id: null,
    report_type: 'near-miss',
    severity: 'high',
    description: 'Unsecured scaffold plank on Level 4 — stepped on it and it shifted about 15cm. If it had gone further it would have been a 4m fall. Scaffold was tagged as inspected yesterday.',
    contributing_factors: 'Plank not properly secured after scaffold was modified for crane access. No edge protection on that bay.',
    actions_taken: 'Secured the plank immediately, notified scaffold supervisor. Area cordoned off pending full inspection.',
    recommended_actions: 'All scaffold modifications should require re-inspection before use. Add to site rules.',
    location_lat: -33.8688,
    location_lng: 151.2093,
    location_address: 'Barangaroo Level 4',
    photo_path: null,
    is_anonymous: false,
    status: 'actioned',
    created_at: `${twoDaysAgo}T10:30:00.000Z`,
  },
  {
    id: 'demo-report-002',
    worker_id: 'demo-worker-001',
    session_id: null,
    report_type: 'hazard',
    severity: 'medium',
    description: 'Water pooling at the base of the stairwell between Level 1 and Level 2. Concrete floor is polished — very slippery when wet. No wet floor signage.',
    contributing_factors: 'Appears to be a leak from the fire services rough-in above. Has been wet for at least 2 days based on staining.',
    actions_taken: 'Put up wet floor signs from the site office. Reported to hydraulics contractor.',
    recommended_actions: 'Fix the leak. Consider anti-slip treatment on stairwell landings.',
    location_lat: -33.8688,
    location_lng: 151.2093,
    location_address: 'Barangaroo Stairwell L1-L2',
    photo_path: null,
    is_anonymous: false,
    status: 'reviewed',
    created_at: `${yesterday}T11:15:00.000Z`,
  },
  {
    id: 'demo-report-003',
    worker_id: 'demo-worker-001',
    session_id: null,
    report_type: 'good-catch',
    severity: 'high',
    description: 'Noticed the crane operator was about to lift a load over an area where two plumbers were working in a trench. Radioed the crane operator to hold the lift until the trench was cleared.',
    contributing_factors: 'Crane exclusion zone signage had blown down in the wind overnight. Plumbers may not have been aware of crane operations today.',
    actions_taken: 'Stopped the lift. Cleared the trench. Re-established exclusion zone signage. Briefed both crane operator and plumbing crew.',
    recommended_actions: 'Crane exclusion zone signage needs to be weighted/secured better. Morning briefing should confirm crane schedule with all trades.',
    location_lat: -33.8688,
    location_lng: 151.2093,
    location_address: 'Barangaroo Ground Floor',
    photo_path: null,
    is_anonymous: false,
    status: 'actioned',
    created_at: `${twoDaysAgo}T14:00:00.000Z`,
  },
  {
    id: 'demo-report-004',
    worker_id: 'demo-worker-001',
    session_id: 'demo-session-003',
    report_type: 'observation',
    severity: 'medium',
    description: 'Found asbestos-backed board behind old switchboard on Level 3. Not identified in the demolition survey. Asbestos management plan may need updating for this area.',
    contributing_factors: 'Demolition survey may not have inspected behind fixed equipment. This is a 1980s building — asbestos is likely in other concealed areas.',
    actions_taken: 'Stopped work. Cordoned area. Notified supervisor and site safety officer. Awaiting assessment from licensed assessor.',
    recommended_actions: 'Commission targeted asbestos survey for all areas where equipment is being removed from original walls/ceilings.',
    location_lat: -33.8688,
    location_lng: 151.2093,
    location_address: 'Barangaroo Level 3 Switchboard',
    photo_path: null,
    is_anonymous: false,
    status: 'open',
    created_at: `${yesterday}T15:40:00.000Z`,
  },
];

// --- Demo Conversation Messages (for the pre-start session) ---
const DEMO_MESSAGES: ConversationMessage[] = [
  {
    id: 'demo-msg-001', session_id: 'demo-session-001', role: 'user',
    content: 'Starting session',
    created_at: `${today}T06:45:00.000Z`,
  },
  {
    id: 'demo-msg-002', session_id: 'demo-session-001', role: 'assistant',
    content: "G'day Dave. 28 degrees today, bit of wind from the northeast. What's on the cards?",
    created_at: `${today}T06:45:05.000Z`,
  },
  {
    id: 'demo-msg-003', session_id: 'demo-session-001', role: 'user',
    content: "Switchboard upgrade on Level 3. Pulling out the old board and putting in a new 3-phase distribution board.",
    created_at: `${today}T06:45:30.000Z`,
  },
  {
    id: 'demo-msg-004', session_id: 'demo-session-001', role: 'assistant',
    content: "Right — live electrical work during the changeover. What's your isolation plan?",
    created_at: `${today}T06:45:35.000Z`,
  },
  {
    id: 'demo-msg-005', session_id: 'demo-session-001', role: 'user',
    content: "Lock-out tag-out on the main supply. I'll verify dead with my voltage tester before touching anything.",
    created_at: `${today}T06:46:00.000Z`,
  },
  {
    id: 'demo-msg-006', session_id: 'demo-session-001', role: 'assistant',
    content: "Good. I noticed your EWP licence has expired — are you using the EWP for that access panel above the board?",
    created_at: `${today}T06:46:05.000Z`,
  },
  {
    id: 'demo-msg-007', session_id: 'demo-session-001', role: 'user',
    content: "Yeah the access panel is about 2.4 metres up. I was going to use the EWP. Didn't realise the ticket had lapsed — I'll check that.",
    created_at: `${today}T06:46:30.000Z`,
  },
  {
    id: 'demo-msg-008', session_id: 'demo-session-001', role: 'assistant',
    content: "Worth sorting — might need someone else to operate it today if it's expired. What else could catch you out up there? Any other trades on Level 3?",
    created_at: `${today}T06:46:35.000Z`,
  },
  {
    id: 'demo-msg-009', session_id: 'demo-session-001', role: 'user',
    content: "Yeah the fitout crew is working nearby. And there'll be dust from cutting new cable runs through the concrete.",
    created_at: `${today}T06:47:00.000Z`,
  },
  {
    id: 'demo-msg-010', session_id: 'demo-session-001', role: 'assistant',
    content: "Good pick on the dust. P2 mask and glasses for the cutting? And have you got the area barricaded so the fitout crew knows to stay clear?",
    created_at: `${today}T06:47:05.000Z`,
  },
  {
    id: 'demo-msg-011', session_id: 'demo-session-001', role: 'user',
    content: "Yep, barricades and signage are going up. The apprentice is with me today too — I'll make sure he knows the no-go zones.",
    created_at: `${today}T06:47:30.000Z`,
  },
  {
    id: 'demo-msg-012', session_id: 'demo-session-001', role: 'assistant',
    content: "That's worth doing properly — new blokes can wander. One more thing — might be worth checking with the mechanical team about their schedule on Level 3 this afternoon. Don't want anyone near your isolation. Anything else on your mind?",
    created_at: `${today}T06:47:35.000Z`,
  },
  {
    id: 'demo-msg-013', session_id: 'demo-session-001', role: 'user',
    content: "No that covers it. Good call on the mech guys, I'll check with them.",
    created_at: `${today}T06:48:00.000Z`,
  },
  {
    id: 'demo-msg-014', session_id: 'demo-session-001', role: 'assistant',
    content: "Right — switchboard upgrade Level 3. You've got isolation with LOTO, dust controls, area barricaded, apprentice briefed. Follow up on the EWP licence and check with the mech team. Work safe, mate.",
    created_at: `${today}T06:48:05.000Z`,
  },
];

// --- Loader ---

export function loadDemoData(): void {
  if (typeof window === 'undefined') return;

  // Store demo worker
  localStorage.setItem('coassure_workers', JSON.stringify([DEMO_WORKER]));
  localStorage.setItem('coassure_worker_id', DEMO_WORKER.id);

  // Store training records
  localStorage.setItem('coassure_training', JSON.stringify(DEMO_TRAINING));

  // Store sessions
  localStorage.setItem('coassure_sessions', JSON.stringify(DEMO_SESSIONS));

  // Store messages
  localStorage.setItem('coassure_messages', JSON.stringify(DEMO_MESSAGES));

  // Store reports
  localStorage.setItem('coassure_reports', JSON.stringify(DEMO_REPORTS));
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('coassure_worker_id') === DEMO_WORKER.id;
}

export function clearDemoData(): void {
  if (typeof window === 'undefined') return;
  const keys = Object.keys(localStorage).filter(k => k.startsWith('coassure_'));
  keys.forEach(k => localStorage.removeItem(k));
}

export { DEMO_WORKER, DEMO_TRAINING, DEMO_SESSIONS, DEMO_REPORTS, DEMO_MESSAGES };
