'use client';

import { getScoreColor, getScoreLabel } from '@/types';

interface ScoreRingProps {
  score: number | null;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZES = {
  sm: { ring: 60, stroke: 5, fontSize: 16, labelSize: 10 },
  md: { ring: 80, stroke: 6, fontSize: 20, labelSize: 11 },
  lg: { ring: 110, stroke: 8, fontSize: 28, labelSize: 12 },
};

export function ScoreRing({ score, label, size = 'md', showLabel = true }: ScoreRingProps) {
  const { ring, stroke, fontSize, labelSize } = SIZES[size];
  const r = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = score !== null ? Math.min(100, Math.max(0, score)) : 0;
  const dashOffset = circumference - (pct / 100) * circumference;
  const color = getScoreColor(score);
  const { label: ratingLabel } = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg width={ring} height={ring} className="-rotate-90">
          {/* Track */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize, color, fontWeight: 700, lineHeight: 1 }}>
            {score !== null ? Math.round(score) : '—'}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p style={{ fontSize: labelSize, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{label}</p>
          <p style={{ fontSize: labelSize - 1, color, fontWeight: 600 }}>{ratingLabel}</p>
        </div>
      )}
    </div>
  );
}
