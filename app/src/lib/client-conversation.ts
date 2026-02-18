// Client-side conversation engine — calls an API proxy to reach Claude
// The proxy URL or API key is configured in settings.

import { WorkerProfile, WeatherData, Session } from './types';
import { getWeatherHazards } from './weather';
import { getApiProxyUrl, getApiKey } from './client-db';

export function buildSystemPrompt(
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
- Temperature: ${weather.temp}\u00b0C
- Conditions: ${weather.conditions}
- Wind: ${weather.wind_speed} km/h ${weather.wind_dir}
- Humidity: ${weather.humidity}%
- UV Index: ${weather.uv_index}
${weatherHazards.length > 0 ? `\nWEATHER-RELATED HAZARDS TO CONSIDER:\n${weatherHazards.map(h => `- ${h}`).join('\n')}` : ''}`;
  }

  const locationContext = location ? `\nLOCATION: ${location}` : '';

  const trainingContext = profile.training_records.length > 0
    ? `\nWORKER CERTIFICATIONS:\n${profile.training_records.map(t =>
        `- ${t.cert_name} (${t.cert_type}) \u2014 ${t.status}${t.expiry_date ? `, expires ${t.expiry_date}` : ''}`
      ).join('\n')}`
    : '';

  const expiringCerts = profile.training_records.filter(t => t.status === 'expiring');
  const expiredCerts = profile.training_records.filter(t => t.status === 'expired');
  let certAlerts = '';
  if (expiringCerts.length > 0 || expiredCerts.length > 0) {
    certAlerts = '\nCERTIFICATION ALERTS:';
    for (const cert of expiredCerts) {
      certAlerts += `\n- EXPIRED: ${cert.cert_name} \u2014 expired ${cert.expiry_date}`;
    }
    for (const cert of expiringCerts) {
      certAlerts += `\n- EXPIRING SOON: ${cert.cert_name} \u2014 expires ${cert.expiry_date}`;
    }
  }

  const sessionTypeInstructions = getSessionTypeInstructions(sessionType);

  return `You are CoAssure, a voice-first safety assistant for field workers. You help workers think through hazards, complete safety documentation, and report incidents \u2014 through conversation, not clipboards.

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
1. Be conversational and natural \u2014 this is a voice interaction, not a form
2. Ask ONE question at a time. Wait for the response before asking another
3. Never lecture. Never condescend. Never assume ignorance
4. If the worker identifies a hazard, acknowledge it genuinely before adding anything
5. Keep responses short \u2014 2-3 sentences max. Workers are on site, not reading essays
6. Use plain language. Say "the wind" not "aeolian conditions"
7. If you spot something the worker hasn't mentioned, frame it as a question not a correction
8. If a certification is expired or expiring, mention it naturally \u2014 don't alarm
9. Always end a session with a brief summary of what was covered`;
}

function getInteractionGuidance(profile: WorkerProfile): string {
  switch (profile.interaction_level) {
    case 'peer':
      return `INTERACTION STYLE: PEER
This worker has ${profile.years_experience} years of experience and a strong safety record. Treat them as a peer.
- Be brief and direct. They know their trade
- Don't explain basic concepts
- Focus on what's specific to today: site conditions, weather, anything unusual
- If you challenge their thinking, do it as "have you thought about..." not "you should..."
- Respect their judgment`;

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
- Provide context when relevant
- Celebrate good thinking when they identify a hazard
- Be the experienced colleague who helps you learn, not the auditor checking your work
- Still keep it natural and conversational`;
  }
}

function getSessionTypeInstructions(sessionType: Session['session_type']): string {
  switch (sessionType) {
    case 'pre-start':
      return `SESSION TYPE: PRE-START TALK-THROUGH
Help the worker think through the job ahead.
Flow: Ask what they're doing today, ask about hazards based on their answer + weather + location, ask about controls, challenge anything missed, summarise.`;

    case 'toolbox-talk':
      return `SESSION TYPE: FACILITATED TOOLBOX TALK
Facilitate a team safety discussion. Draw out quieter members, challenge generic answers, capture key points and actions. You're a facilitator, not a lecturer.`;

    case 'form-assist':
      return `SESSION TYPE: FORM ASSISTANT
Help fill out a safety form through conversation. Work through each section, challenge generic answers, fill in context you know. Make it feel like a conversation, not a chore.`;

    case 'report':
      return `SESSION TYPE: EASY REPORTING
Help file an incident/hazard/observation report quickly. Ask what happened, clarify type and severity, ask about contributing factors and actions taken, offer anonymous option. Keep it to 30 seconds.`;

    case 'reflection':
      return `SESSION TYPE: POST-JOB REFLECTION
Help capture what happened and what the next person should know. Ask how the job went, what was unexpected, offer to file reports if needed. Keep it brief and genuine.`;
  }
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

export async function generateSummary(transcript: string): Promise<string> {
  return sendToAi(
    'Summarise this safety conversation in a brief, structured format. Include: task description, hazards identified, controls confirmed, and any actions or follow-ups. Keep it concise.',
    [{ role: 'user', content: transcript }],
    500
  );
}
