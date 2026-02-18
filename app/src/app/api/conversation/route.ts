import { NextRequest, NextResponse } from 'next/server';
import { createSession, sendMessage, completeSession, getSessionMessages } from '@/lib/conversation';
import { getWorkerProfile } from '@/lib/worker-profile';
import { getWeather } from '@/lib/weather';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start': {
        const { worker_id, session_type, latitude, longitude, address } = body;

        if (!worker_id || !session_type) {
          return NextResponse.json(
            { error: 'worker_id and session_type are required' },
            { status: 400 }
          );
        }

        const profile = getWorkerProfile(worker_id);
        if (!profile) {
          return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
        }

        let weather = null;
        if (latitude && longitude) {
          try {
            weather = await getWeather(latitude, longitude);
          } catch {
            // Weather fetch failed — continue without it
          }
        }

        const location = latitude && longitude
          ? { lat: latitude, lng: longitude, address }
          : undefined;

        const session = await createSession(worker_id, session_type, location, weather ?? undefined);

        // Send initial greeting
        const greeting = await sendMessage(session.id, profile, 'Starting session', weather);

        const messages = getSessionMessages(session.id);

        return NextResponse.json({
          session,
          messages,
          weather,
          profile: {
            safety_score: profile.safety_score,
            interaction_level: profile.interaction_level,
          },
        }, { status: 201 });
      }

      case 'message': {
        const { session_id, worker_id, content, latitude, longitude } = body;

        if (!session_id || !worker_id || !content) {
          return NextResponse.json(
            { error: 'session_id, worker_id, and content are required' },
            { status: 400 }
          );
        }

        const profile = getWorkerProfile(worker_id);
        if (!profile) {
          return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
        }

        let weather = null;
        if (latitude && longitude) {
          try {
            weather = await getWeather(latitude, longitude);
          } catch {
            // Continue without weather
          }
        }

        const response = await sendMessage(session_id, profile, content, weather);

        return NextResponse.json({ response });
      }

      case 'complete': {
        const { session_id } = body;

        if (!session_id) {
          return NextResponse.json(
            { error: 'session_id is required' },
            { status: 400 }
          );
        }

        const session = await completeSession(session_id);
        return NextResponse.json({ session });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, message, or complete' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Conversation error:', error);
    return NextResponse.json({ error: 'Conversation failed' }, { status: 500 });
  }
}
