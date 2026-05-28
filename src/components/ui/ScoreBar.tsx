'use client';

import { getScoreColor, getScoreLabel } from '@/types';
import { cn } from '@/lib/utils';

interface ScoreBarProps {
  score: number | null;
  label: string;
  description?: string;
}

export function ScoreBar({ score, label, description }: ScoreBarProps) {
  const color = getScoreColor(score);
  const { label: ratingLabel } = getScoreLabel(score);
  const pct = score !== null ? Math.min(100, Math.max(0, score)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-slate-300">{label}</span>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span className="text-xs font-medium" style={{ color }}>{ratingLabel}</span>
          <span className="text-sm font-bold tabular-nums" style={{ color }}>
            {score !== null ? Math.round(score) : '—'}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </div>
  );
}
