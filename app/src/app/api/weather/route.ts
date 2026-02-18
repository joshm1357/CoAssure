import { NextRequest, NextResponse } from 'next/server';
import { getWeather, getWeatherHazards } from '@/lib/weather';

export async function GET(request: NextRequest) {
  try {
    const lat = request.nextUrl.searchParams.get('lat');
    const lng = request.nextUrl.searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng query parameters are required' },
        { status: 400 }
      );
    }

    const weather = await getWeather(parseFloat(lat), parseFloat(lng));
    const hazards = getWeatherHazards(weather);

    return NextResponse.json({ weather, hazards });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
