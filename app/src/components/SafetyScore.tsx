'use client';

interface SafetyScoreProps {
  score: number;
  level: 'peer' | 'standard' | 'supportive';
  compact?: boolean;
}

export default function SafetyScore({ score, level, compact }: SafetyScoreProps) {
  const getColor = () => {
    if (score >= 75) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-orange-500';
  };

  const getRingColor = () => {
    if (score >= 75) return 'stroke-emerald-500';
    if (score >= 50) return 'stroke-amber-500';
    return 'stroke-orange-500';
  };

  const getLevelLabel = () => {
    switch (level) {
      case 'peer': return 'Experienced';
      case 'standard': return 'Established';
      case 'supportive': return 'Building';
    }
  };

  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 100) * circumference;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold ${getColor()}`}>{score}</span>
        <span className="text-xs text-zinc-500">{getLevelLabel()}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-zinc-200 dark:text-zinc-700"
          />
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={getRingColor()}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${getColor()}`}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-zinc-500">{getLevelLabel()}</span>
    </div>
  );
}
