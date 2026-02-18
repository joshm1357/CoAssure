import { WeatherData } from './types';

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const WIND_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function degreesToDirection(degrees: number): string {
  const index = Math.round(degrees / 22.5) % 16;
  return WIND_DIRECTIONS[index];
}

export async function getWeather(lat: number, lng: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,uv_index`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;

  return {
    temp: current.temperature_2m,
    conditions: WMO_CODES[current.weather_code] || 'Unknown',
    wind_speed: current.wind_speed_10m,
    wind_dir: degreesToDirection(current.wind_direction_10m),
    humidity: current.relative_humidity_2m,
    uv_index: current.uv_index,
  };
}

export function getWeatherHazards(weather: WeatherData): string[] {
  const hazards: string[] = [];

  if (weather.temp >= 35) {
    hazards.push('Extreme heat — risk of heat stress. Ensure hydration, shade breaks, and watch for symptoms.');
  } else if (weather.temp >= 30) {
    hazards.push('High temperature — increase water intake, schedule heavy tasks for cooler hours.');
  }

  if (weather.temp <= 5) {
    hazards.push('Cold conditions — risk of reduced dexterity, slips on frost. Wear appropriate layers.');
  }

  if (weather.wind_speed >= 40) {
    hazards.push('Strong winds — secure loose materials, avoid elevated work if possible. Consider stopping crane operations.');
  } else if (weather.wind_speed >= 25) {
    hazards.push('Moderate to strong winds — be aware of loose materials and debris.');
  }

  if (weather.conditions.toLowerCase().includes('rain') || weather.conditions.toLowerCase().includes('drizzle')) {
    hazards.push('Wet conditions — slippery surfaces. Check footing, consider non-slip measures.');
  }

  if (weather.conditions.toLowerCase().includes('thunderstorm')) {
    hazards.push('Thunderstorm — cease outdoor and elevated work. Move to shelter. Lightning risk.');
  }

  if (weather.conditions.toLowerCase().includes('fog')) {
    hazards.push('Reduced visibility — use additional lighting, increase vehicle awareness.');
  }

  if (weather.uv_index >= 8) {
    hazards.push('Very high UV — sunscreen, hat, long sleeves. Minimise direct sun exposure.');
  } else if (weather.uv_index >= 6) {
    hazards.push('High UV — wear sunscreen and hat, seek shade during breaks.');
  }

  return hazards;
}
