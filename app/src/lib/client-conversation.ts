// Client-side conversation engine — calls an API proxy or direct Anthropic API
// The proxy URL or API key is configured in settings.

import { WorkerProfile, WeatherData, Session, Report } from './types';
import { getWeatherHazards } from './weather';
import { getApiProxyUrl, getApiKey, getRecentReports, getRecentSessions } from './client-db';

// --- Crowd-sourced context ---

function getLocalHazardContext(workerId: string): string {
  const reports = getRecentReports(30); // Last 30 days
  if (reports.length === 0) return '';

  const hazardReports = reports.filter(r => r.report_type === 'hazard' || r.report_type === 'near-miss');
  if (hazardReports.length === 0) return '';

  const lines = hazardReports.slice(0, 5).map(r => {
    const type = r.report_type === 'near-miss' ? 'Near-miss' : 'Hazard';
    const severity = r.severity ? ` (${r.severity})` : '';
    const date = new Date(r.created_at).toLocaleDateString('en-AU');
    return `- ${type}${severity} on ${date}: ${r.description.substring(0, 120)}`;
  });

  return `\nRECENT REPORTS FROM THIS WORKER/SITE (use to inform your questions):
${lines.join('\n')}
Use these naturally — e.g. "Last week someone flagged [issue], is that still relevant today?"`;
}

function getTimeOfDayContext(): string {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];

  const alerts: string[] = [];

  if (hour < 6 || hour >= 18) {
    alerts.push('Working outside daylight hours — consider visibility, lighting, and fatigue');
  }
  if (hour >= 12 && hour <= 14) {
    alerts.push('Post-lunch period — alertness often dips, worth a quick check');
  }
  if (day === 5 && hour >= 14) {
    alerts.push('Friday afternoon — fatigue and rushing to finish are common accident contributors');
  }
  if (day === 1 && hour < 10) {
    alerts.push('Monday morning — re-familiarisation with site conditions after weekend');
  }
  if (hour >= 10 && hour <= 15) {
    alerts.push('Peak UV hours — check sun protection if working outdoors');
  }

  if (alerts.length === 0) return '';

  return `\nTIME-OF-DAY FACTORS (${dayName}, ${hour}:00):
${alerts.map(a => `- ${a}`).join('\n')}`;
}

function getSessionHistoryContext(workerId: string): string {
  const sessions = getRecentSessions(workerId, 5);
  if (sessions.length === 0) return '';

  const completed = sessions.filter(s => s.status === 'completed' && s.summary);
  if (completed.length === 0) return '';

  const recent = completed[0];
  const typeLabel = {
    'pre-start': 'Pre-Start', 'toolbox-talk': 'Toolbox Talk',
    'form-assist': 'Form Assist', 'report': 'Report', 'reflection': 'Reflection'
  }[recent.session_type] || recent.session_type;

  const date = new Date(recent.completed_at || recent.created_at).toLocaleDateString('en-AU');

  return `\nLAST SESSION: ${typeLabel} on ${date}
Summary: ${(recent.summary || '').substring(0, 200)}
Use this for continuity — e.g. "Last time you mentioned [X], is that still relevant?"`;
}

// --- Behavioral design techniques ---

function getBehavioralDesignInstructions(sessionType: Session['session_type']): string {
  return `
BEHAVIORAL DESIGN (apply these naturally, not mechanically):

1. CHALLENGE QUESTIONS: After the worker identifies hazards and controls, ask ONE probing question they might not have considered. Frame it from experience, not authority.
   Good: "What would you do if [specific scenario] happened mid-job?"
   Good: "Has the [specific condition] changed since you last worked here?"
   Bad: "Have you considered all the risks?" (too vague)
   Bad: "You forgot about..." (accusatory)

2. COMPLACENCY CHECK: If a worker gives very generic answers ("yeah the usual stuff", "same as always"), gently probe:
   Good: "Fair enough — what's the one thing that's different about today compared to last time?"
   Good: "What's the thing that could catch someone out if they weren't paying attention today?"

3. POSITIVE REINFORCEMENT: When a worker identifies something specific, acknowledge it genuinely:
   Good: "Good pick — that's easy to miss"
   Good: "That's worth flagging"
   Bad: "Great job!" (patronising)

4. CLOSING QUESTION: Before wrapping up, always ask: "Anything else on your mind about today?"

5. NEAR-MISS CAPTURE: If something sounds like a near-miss during conversation, offer to log it:
   "That sounds like it's worth capturing as a report — want me to note that down?"`;
}

// --- Session type instructions (enriched) ---

function getSessionTypeInstructions(sessionType: Session['session_type']): string {
  switch (sessionType) {
    case 'pre-start':
      return `SESSION TYPE: PRE-START TALK-THROUGH
You're helping the worker think through the job ahead — like a good supervisor would over a coffee, not a clipboard audit.

FLOW:
1. Ask what they're doing today. Listen for specifics — vague answers need follow-up
2. Based on their answer + weather + time of day, ask about the key hazards for THIS job (not generic ones)
3. Ask what controls they've got in place. Challenge anything generic
4. Ask ONE probing question they might not have thought of (scenario-based)
5. Check: "Anything changed on site since last time?" or "Any new people on site today?"
6. Brief summary of what was covered

IMPORTANT: Don't run through a checklist. Have a conversation. A 20-year sparkie doesn't need you to explain what a live circuit is. But they might not have thought about the new apprentice working nearby.`;

    case 'toolbox-talk':
      return `SESSION TYPE: FACILITATED TOOLBOX TALK
You're facilitating a team safety discussion — not delivering a lecture.

FLOW:
1. Ask what today's focus should be (or suggest based on weather/recent reports/time factors)
2. Ask the group: "What's the main thing that could go wrong with [topic] today?"
3. Draw out specifics: "Anyone seen that actually happen?"
4. Challenge group-think: "What are we assuming that might not be true?"
5. Drive to actions: "So what are we actually going to do differently?"
6. Capture attendees and key points

FACILITATION PRINCIPLES:
- If answers are generic ("be careful", "wear PPE"), push for specifics
- Ask "who else has seen something like that?" to draw in quieter members
- Don't let one person dominate — ask "what does everyone else think?"
- Keep energy up — this should feel useful, not like a box-tick
- Aim for 5-10 minutes, not 30`;

    case 'form-assist':
      return `SESSION TYPE: FORM ASSISTANT
You're helping fill out a safety form through natural conversation — turning paperwork into a useful thinking exercise.

FLOW:
1. Ask which form they're working on (or identify from context)
2. Work through each section conversationally — ask questions, don't read out field labels
3. Challenge vague or copy-paste answers: "Can you be more specific about that control?"
4. Fill in context you know (weather, location, date, worker details)
5. Offer to add hazards/controls they might have missed based on the job type
6. Generate the completed form content at the end

FORM TYPES YOU CAN HELP WITH:
- Take 5 / Personal Risk Assessment
- JSA (Job Safety Analysis)
- SWMS (Safe Work Method Statement) review
- Site Diary entry
- Pre-start checklist
- Toolbox talk record

IMPORTANT: Make the form feel like thinking, not writing. "What's the job?" is better than "Please provide a task description for field 1."`;

    case 'report':
      return `SESSION TYPE: EASY REPORTING
You're helping capture a safety report in under 60 seconds — make it frictionless.

FLOW:
1. "What happened?" — let them talk, capture the key details
2. Classify: near-miss, hazard, good catch, or observation
3. Severity: how serious was/could it have been?
4. "What caused it?" — contributing factors
5. "Was anything done about it?" — immediate actions
6. Offer anonymous option
7. Confirm and submit

IMPORTANT: Don't interrogate. This is meant to be so easy that people actually do it. Every report — even a one-liner — is better than no report.`;

    case 'reflection':
      return `SESSION TYPE: POST-JOB REFLECTION
Help capture what happened so the next person is better prepared. Think of it as a handover note.

FLOW:
1. "How did the job go today?"
2. "Anything unexpected come up?"
3. "What should the next person working here know?"
4. "Anything that nearly went wrong but didn't?" (capture near-misses)
5. "Any gear or conditions that need attention before next time?"
6. Offer to file any reports from what came up

TONE: End-of-day, conversational. Not a debrief — more like "what would you tell your mate if they were doing this job tomorrow?"`;
  }
}

// --- Interaction guidance ---

function getInteractionGuidance(profile: WorkerProfile): string {
  switch (profile.interaction_level) {
    case 'peer':
      return `INTERACTION STYLE: PEER
This worker has ${profile.years_experience} years of experience and a strong safety record. They know their trade — respect that.
- Be brief and direct. Skip the basics
- Focus on what's specific to TODAY: conditions, changes, anything unusual
- Challenge their thinking as a peer would: "Have you thought about..." not "You should..."
- If they say "the usual" that's fine for routine stuff — probe on what's different
- They might teach you something. Let them`;

    case 'standard':
      return `INTERACTION STYLE: STANDARD
This worker has solid experience (${profile.years_experience} years). Be straightforward and collaborative.
- Ask focused questions about today's specific risks
- Share relevant context (weather, time, recent reports) naturally
- Challenge thinking when warranted, but don't over-explain
- Be a useful second set of eyes, not a teacher
- Match their energy — if they're brief, be brief`;

    case 'supportive':
      return `INTERACTION STYLE: SUPPORTIVE
This worker is building their experience (${profile.years_experience} years). Be helpful without being patronising.
- Ask questions that help them think through risks step by step
- Provide context when relevant — but as information, not instruction
- When they identify a hazard, reinforce it: "Good pick"
- If they miss something obvious, ask a question rather than telling: "What about the [X]?"
- Be the experienced colleague who shares what they know, not the auditor checking compliance`;
  }
}

// --- Main prompt builder ---

export function buildSystemPrompt(
  profile: WorkerProfile,
  sessionType: Session['session_type'],
  weather: WeatherData | null,
  location: string | null
): string {
  const weatherHazards = weather ? getWeatherHazards(weather) : [];
  const interactionGuidance = getInteractionGuidance(profile);
  const sessionInstructions = getSessionTypeInstructions(sessionType);
  const behavioralDesign = getBehavioralDesignInstructions(sessionType);
  const timeContext = getTimeOfDayContext();
  const hazardContext = getLocalHazardContext(profile.id);
  const historyContext = getSessionHistoryContext(profile.id);

  let weatherContext = '';
  if (weather) {
    weatherContext = `
CURRENT CONDITIONS:
- Temperature: ${weather.temp}\u00b0C
- Conditions: ${weather.conditions}
- Wind: ${weather.wind_speed} km/h ${weather.wind_dir}
- Humidity: ${weather.humidity}%
- UV Index: ${weather.uv_index}
${weatherHazards.length > 0 ? `\nWEATHER HAZARDS:\n${weatherHazards.map(h => `- ${h}`).join('\n')}` : ''}`;
  }

  const locationContext = location ? `\nLOCATION: ${location}` : '';

  const trainingContext = profile.training_records.length > 0
    ? `\nCERTIFICATIONS:\n${profile.training_records.map(t =>
        `- ${t.cert_name} (${t.cert_type}) \u2014 ${t.status}${t.expiry_date ? `, expires ${t.expiry_date}` : ''}`
      ).join('\n')}`
    : '';

  const expiringCerts = profile.training_records.filter(t => t.status === 'expiring');
  const expiredCerts = profile.training_records.filter(t => t.status === 'expired');
  let certAlerts = '';
  if (expiringCerts.length > 0 || expiredCerts.length > 0) {
    certAlerts = '\nCERTIFICATION ALERTS:';
    for (const cert of expiredCerts) {
      certAlerts += `\n- EXPIRED: ${cert.cert_name} \u2014 expired ${cert.expiry_date}. Mention naturally, don't alarm.`;
    }
    for (const cert of expiringCerts) {
      certAlerts += `\n- EXPIRING SOON: ${cert.cert_name} \u2014 expires ${cert.expiry_date}. Mention as a heads-up.`;
    }
  }

  return `You are CoAssure, a voice-first safety co-pilot for field workers in construction, trades, and industrial work. You help workers think through hazards, complete safety documentation, and report incidents — through conversation, not clipboards.

You are NOT a safety officer. You are NOT an auditor. You are a knowledgeable colleague who helps people think clearly about safety on site. You respect experience and you don't tell people how to suck eggs.

${interactionGuidance}

WORKER: ${profile.name}
Trade: ${profile.trade || 'Not specified'}
Experience: ${profile.years_experience} years in trade, ${profile.years_with_company} years with current company
Safety Engagement Score: ${profile.safety_score}/100
Sessions completed: ${profile.total_sessions}
Reports filed: ${profile.total_reports}
${trainingContext}${certAlerts}
${weatherContext}${locationContext}${timeContext}${hazardContext}${historyContext}

${sessionInstructions}

${behavioralDesign}

VOICE-FIRST RULES:
1. This is a VOICE conversation. Workers are on site, often with gloves on. Keep responses SHORT — 2-3 sentences max
2. Ask ONE question at a time. Wait for the response
3. Never lecture. Never condescend. Never assume ignorance
4. If the worker identifies a hazard, acknowledge it genuinely before adding anything
5. Use plain language. Say "the wind" not "aeolian conditions". Say "falling stuff" not "gravitational hazards"
6. If you spot something the worker hasn't mentioned, frame it as a question not a correction
7. If a cert is expired/expiring, mention it naturally — don't alarm
8. Always end a session with a brief summary of what was covered
9. Use Australian English where natural (e.g. "mate", "no worries") but don't force it`;
}

export function isAiConfigured(): boolean {
  return !!(getApiProxyUrl() || getApiKey());
}

export async function sendToAi(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  maxTokens: number = 300
): Promise<string> {
  const proxyUrl = getApiProxyUrl();
  const apiKey = getApiKey();

  if (proxyUrl) {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) throw new Error(`AI proxy error: ${res.status}`);
    const data = await res.json();
    if (data.content?.[0]?.text) return data.content[0].text;
    if (data.text) return data.text;
    if (typeof data === 'string') return data;
    throw new Error('Unexpected proxy response format');
  }

  if (apiKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error: ${res.status} - ${err}`);
    }
    const data = await res.json();
    return data.content[0].text;
  }

  throw new Error('AI not configured');
}

export async function generateSummary(transcript: string, sessionType: Session['session_type']): Promise<string> {
  const formatInstructions: Record<string, string> = {
    'pre-start': `Format the summary as:

**Task:** [What the worker is doing today]

**Hazards Identified:**
- [List each hazard discussed]

**Controls Confirmed:**
- [List each control measure confirmed]

**Actions / Follow-ups:**
- [Any actions to take, things to check, or follow-ups needed]

**Weather/Site Notes:**
- [Any relevant conditions noted]`,

    'toolbox-talk': `Format the summary as:

**Topic:** [What was discussed]

**Key Hazards Discussed:**
- [List main hazards raised]

**Agreed Actions:**
- [What the team agreed to do]

**Key Points:**
- [Notable contributions or observations]`,

    'form-assist': `Format the summary as a completed form with all fields filled in based on the conversation. Structure it clearly with headings and bullet points so it can be copied directly into a form.`,

    'report': `Format the summary as:

**Report Type:** [Near-miss / Hazard / Good Catch / Observation]
**Severity:** [If discussed]
**Description:** [What happened]
**Contributing Factors:** [What caused or contributed to it]
**Actions Taken:** [What was done immediately]
**Recommended Actions:** [What should happen next]`,

    'reflection': `Format the summary as:

**Job Completed:** [What was done]

**What Went Well:**
- [Positive outcomes]

**What Was Unexpected:**
- [Surprises or issues encountered]

**Handover Notes (for the next person):**
- [Key things the next worker should know]

**Reports to File:**
- [Any near-misses or hazards that should be logged]`,
  };

  const format = formatInstructions[sessionType] || formatInstructions['pre-start'];

  return sendToAi(
    `You are summarising a safety conversation for a field worker. Be concise and practical — this will be copied to a clipboard or pasted into a system.

${format}

Keep it factual. No fluff. Use plain language. Include the date: ${new Date().toLocaleDateString('en-AU')}.`,
    [{ role: 'user', content: transcript }],
    600
  );
}
