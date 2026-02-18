'use client';

interface WeatherBannerProps {
  temp: number;
  conditions: string;
  wind_speed: number;
  wind_dir: string;
  hazards: string[];
}

export default function WeatherBanner({ temp, conditions, wind_speed, wind_dir, hazards }: WeatherBannerProps) {
  return (
    <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-light text-sky-700 dark:text-sky-300">{Math.round(temp)}&deg;</span>
          <div>
            <p className="text-sm font-medium text-sky-800 dark:text-sky-200">{conditions}</p>
            <p className="text-xs text-sky-600 dark:text-sky-400">Wind {wind_speed} km/h {wind_dir}</p>
          </div>
        </div>
      </div>
      {hazards.length > 0 && (
        <div className="mt-2 pt-2 border-t border-sky-200 dark:border-sky-800">
          {hazards.map((h, i) => (
            <p key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5 mt-1">
              <span className="shrink-0 mt-0.5">!</span>
              <span>{h}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
