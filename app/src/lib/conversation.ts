import Anthropic from '@anthropic-ai/sdk';
import { getDb } from './db';
import { WorkerProfile, WeatherData, ConversationMessage, Session } from './types';
import { getWeatherHazards } from './weather';
import { v4 as uuid } from 'uuid';

const anthropic = new Anthropic();

function buildSystemPrompt(
  profile: WorkerProfile,
  sessionType: Session['session_type'],
  weather: WeatherData | null,
  location: string | null
): string {
  const weatherHazards = weather ? getWeatherHazards(weather) : [];

  const interactionGuidance = getInteractionGuidance(profile);

  let weatherContext = '';
  if (weather) {
    weatherContext = `
CURRENT CONDITIONS:
- Temperature: ${weather.temp}°C
- Conditions: ${weather.conditions}
- Wind: ${weather.wind_speed} km/h ${weather.wind_dir}
- Humidity: ${weather.humidity}%
- UV Index: ${weather.uv_index}
${weatherHazards.length > 0 ? `\nWEATHER-RELATED HAZARDS TO CONSIDER:\n${weatherHazards.map(h => `- ${h}`).join('\n')}` : ''}`;
  }

  const locationContext = location ? `\nLOCATION: ${location}` : '';

  const trainingContext = profile.training_records.length > 0
    ? `\nWORKER CERTIFICATIONS:\n${profile.training_records.map(t =>
        `- ${t.cert_name} (${t.cert_type}) — ${t.status}${t.expiry_date ? `, expires ${t.expiry_date}` : ''}`
      ).join('\n')}`
    : '';

  const expiringCerts = profile.training_records.filter(t => t.status === 'expiring');
  const expiredCerts = profile.training_records.filter(t => t.status === 'expired');
  let certAlerts = '';
  if (expiringCerts.length > 0 || expiredCerts.length > 0) {
    certAlerts = '\nCERTIFICATION ALERTS:';
    for (const cert of expiredCerts) {
      certAlerts += `\n- EXPIRED: ${cert.cert_name} — expired ${cert.expiry_date}`;
    }
    for (const cert of expiringCerts) {
      certAlerts += `\n- EXPIRING SOON: ${cert.cert_name} — expires ${cert.expiry_date}`;
    }
  }

  const sessionTypeInstructions = getSessionTypeInstructions(sessionType);

  return `You are CoAssure, a voice-first safety assistant for field workers. You help workers think through hazards, complete safety documentation, and report incidents — through conversation, not clipboards.

${interactionGuidance}

WORKER: ${profile.name}
Trade: ${profile.trade || 'Not specified'}
Experience: ${profile.years_experience} years in trade, ${profile.years_with_company} years with current company
Safety Score: ${profile.safety_score}/100
Sessions completed: ${profile.total_sessions}
Reports filed: ${profile.total_reports}
${trainingContext}${certAlerts}
${weatherContext}${locationContext}

${sessionTypeInstructions}

CRITICAL RULES:
1. Be conversational and natural — this is a voice interaction, not a form
2. Ask ONE question at a time. Wait for the response before asking another
3. Never lecture. Never condescend. Never assume ignorance
4. If the worker identifies a hazard, acknowledge it genuinely before adding anything
5. Keep responses short — 2-3 sentences max. Workers are on site, not reading essays
6. Use plain language. Say "the wind" not "aeolian conditions"
7. If you spot something the worker hasn't mentioned, frame it as a question not a correction
8. If a certification is expired or expiring, mention it naturally — don't alarm
9. Always end a session with a brief summary of what was covered`;
}

function getInteractionGuidance(profile: WorkerProfile): string {
  switch (profile.interaction_level) {
    case 'peer':
      return `INTERACTION STYLE: PEER
This worker has ${profile.years_experience} years of experience and a strong safety record. Treat them as a peer.
- Be brief and direct. They know their trade
- Don't explain basic concepts — they'll find it patronising
- Focus on what's specific to today: site conditions, weather, anything unusual
- If you challenge their thinking, do it as "have you thought about..." not "you should..."
- Respect their judgment. They've likely seen more than you know`;

    case 'standard':
      return `INTERACTION STYLE: STANDARD
This worker has solid experience. Be straightforward and collaborative.
- Ask focused questions about today's specific risks
- Share relevant context (weather, location) naturally
- Challenge thinking when warranted, but don't over-explain
- Be a useful second set of eyes, not a teacher`;

    case 'supportive':
      return `INTERACTION STYLE: SUPPORTIVE
This worker is building their experience. Be helpful and encouraging, never condescending.
- Ask questions that help them think through risks step by step
- Provide context when relevant — explain why something matters, briefly
- Celebrate good thinking — "good pick-up" when they identify a hazard
- Be the experienced colleague who helps you learn, not the auditor checking your work
- Still keep it natural and conversational — not a training module`;
  }
}

function getSessionTypeInstructions(sessionType: Session['session_type']): string {
  switch (sessionType) {
    case 'pre-start':
      return `SESSION TYPE: PRE-START TALK-THROUGH
Help the worker think through the job ahead. This is not a form — it's a conversation.

Flow:
1. Ask what they're working on today
2. Based on their answer + weather + location, ask about specific hazards they might face
3. If they identify hazards, ask what controls they're putting in place
4. Challenge with anything they might have missed — weather, proximity to public, services, fatigue
5. Confirm they're good to go, summarise what was discussed

If there are weather-related hazards, weave them in naturally ("it's going to be 38 degrees today — how are you planning to manage the heat?") rather than listing them.`;

    case 'toolbox-talk':
      return `SESSION TYPE: FACILITATED TOOLBOX TALK
You're helping facilitate a team safety discussion. This is a group conversation.

Flow:
1. Ask what the focus of today's talk is (or suggest one based on conditions/recent events)
2. Facilitate discussion — draw out quieter team members, ask for specific examples
3. If someone raises a point, ask the group if they've seen something similar
4. Challenge generic answers — "we'll be careful" isn't a control
5. Capture the key points, actions, and who's responsible
6. Summarise at the end with clear action items

Your role is facilitator, not lecturer. Keep the team talking, not you.`;

    case 'form-assist':
      return `SESSION TYPE: FORM ASSISTANT
Help the worker fill out a safety form through conversation. The worker has scanned or photographed a form, and you're walking them through it.

Flow:
1. Acknowledge which form they're filling out
2. Work through each section conversationally — ask what's relevant, help them articulate it
3. For generic sections (like SWMS), challenge them to be site-specific
4. Fill in what you can from context (weather, location, date)
5. Present the completed form for review before finalising

Make forms feel like a conversation, not a chore.`;

    case 'report':
      return `SESSION TYPE: EASY REPORTING
Help the worker file an incident/hazard/observation report quickly and thoroughly.

Flow:
1. Ask what happened (or what they observed)
2. Clarify the type: near-miss, hazard, good catch, or observation
3. Ask about severity and who/what was affected
4. Ask about contributing factors — but keep it conversational
5. Ask if any immediate action was taken
6. Ask if they want it filed anonymously
7. Confirm the report and thank them for reporting

Keep it quick. The whole thing should feel like a 30-second chat, not an interrogation. Every report filed is valuable — make them feel that.`;

    case 'reflection':
      return `SESSION TYPE: POST-JOB REFLECTION
Help the worker capture what happened and what the next person should know.

Flow:
1. Ask how the job went
2. Ask if anything unexpected came up
3. Ask if there's anything the next person working here should know
4. If they mention a near-miss or issue, offer to file a report
5. Summarise the key takeaways

This is the debrief. Keep it brief and genuine.`;
  }
}

export async function createSession(
  workerId: string,
  sessionType: Session['session_type'],
  location?: { lat: number; lng: number; address?: string },
  weather?: WeatherData
): Promise<Session> {
  const db = getDb();
  const id = uuid();

  db.prepare(`
    INSERT INTO sessions (id, worker_id, session_type, location_lat, location_lng, location_address,
      weather_temp, weather_conditions, weather_wind_speed, weather_wind_dir)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, workerId, sessionType,
    location?.lat || null, location?.lng || null, location?.address || null,
    weather?.temp || null, weather?.conditions || null,
    weather?.wind_speed || null, weather?.wind_dir || null
  );

  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session;
}

export async function sendMessage(
  sessionId: string,
  profile: WorkerProfile,
  userMessage: string,
  weather: WeatherData | null
): Promise<string> {
  const db = getDb();

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session | undefined;
  if (!session) throw new Error('Session not found');

  // Save user message
  db.prepare(
    'INSERT INTO conversation_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)'
  ).run(uuid(), sessionId, 'user', userMessage);

  // Get conversation history
  const messages = db.prepare(
    'SELECT role, content FROM conversation_messages WHERE session_id = ? ORDER BY created_at ASC'
  ).all(sessionId) as { role: string; content: string }[];

  const systemPrompt = buildSystemPrompt(
    profile,
    session.session_type,
    weather,
    session.location_address
  );

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 300,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const assistantMessage = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  // Save assistant message
  db.prepare(
    'INSERT INTO conversation_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)'
  ).run(uuid(), sessionId, 'assistant', assistantMessage);

  return assistantMessage;
}

export async function completeSession(sessionId: string): Promise<Session> {
  const db = getDb();

  const messages = db.prepare(
    'SELECT role, content FROM conversation_messages WHERE session_id = ? ORDER BY created_at ASC'
  ).all(sessionId) as { role: string; content: string }[];

  const transcript = messages.map(m => `${m.role === 'user' ? 'Worker' : 'CoAssure'}: ${m.content}`).join('\n\n');

  // Generate summary
  const summaryResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    system: 'Summarise this safety conversation in a brief, structured format. Include: task description, hazards identified, controls confirmed, and any actions or follow-ups. Keep it concise — this goes into a safety record.',
    messages: [{ role: 'user', content: transcript }],
  });

  const summary = summaryResponse.content[0].type === 'text'
    ? summaryResponse.content[0].text
    : '';

  db.prepare(`
    UPDATE sessions SET
      status = 'completed',
      transcript = ?,
      summary = ?,
      completed_at = datetime('now')
    WHERE id = ?
  `).run(transcript, summary, sessionId);

  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session;
}

export function getSessionMessages(sessionId: string): ConversationMessage[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM conversation_messages WHERE session_id = ? ORDER BY created_at ASC'
  ).all(sessionId) as ConversationMessage[];
}
