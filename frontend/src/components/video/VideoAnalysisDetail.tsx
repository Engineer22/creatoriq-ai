'use client';

import { useState } from 'react';
import { Video, ActionPlanItem } from '@/types';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { formatNumber, formatDuration, platformColor } from '@/types';

import {
  CheckCircle2,
  TrendingUp,
  Target,
  Lightbulb,
  Wand2,
  ChevronDown,
  ChevronRight,
  Star,
  AlertTriangle
} from 'lucide-react';

import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const SCORE_METRICS = [
  { key: 'hook_score', label: 'Hook', desc: 'First-impression & attention capture' },
  { key: 'retention_score', label: 'Retention', desc: 'Ability to keep viewers watching' },
  { key: 'emotion_score', label: 'Emotion', desc: 'Emotional resonance & depth' },
  { key: 'viral_score', label: 'Viral Potential', desc: 'Shareability & reach potential' },
  { key: 'storytelling_score', label: 'Storytelling', desc: 'Narrative structure & arc' },
  { key: 'cta_score', label: 'CTA', desc: 'Call-to-action effectiveness' },
  { key: 'pacing_score', label: 'Pacing', desc: 'Energy, cuts & information density' },
] as const;

interface Props {
  video: Video;
}

export function VideoAnalysisDetail({ video }: Props) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'deep-dive' | 'improvements' | 'script'
  >('overview');

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const analysis = video.analysis;
  const pColor = platformColor(video.platform);

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'deep-dive', label: 'Deep Dive' },
    { id: 'improvements', label: 'Action Plan' },
    { id: 'script', label: 'Improved Script' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Video header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-4">
          {video.thumbnail_url && (
            <div className="relative w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
              <img
                src={video.thumbnail_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md"
                style={{
                  background: `${pColor}20`,
                  color: pColor,
                }}
              >
                {video.platform.toUpperCase()}
              </span>

              {video.creator_handle && (
                <span className="text-xs text-slate-500">
                  @{video.creator_handle}
                </span>
              )}
            </div>

            <h1 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {video.title}
            </h1>

            <div className="flex items-center flex-wrap gap-4 text-xs text-slate-500">
              {video.views && <span>👁 {formatNumber(video.views)} views</span>}
              {video.likes && <span>❤️ {formatNumber(video.likes)} likes</span>}
              {video.comments && (
                <span>💬 {formatNumber(video.comments)} comments</span>
              )}
              {video.duration && (
                <span>⏱ {formatDuration(video.duration)}</span>
              )}
              {video.engagement_rate && (
                <span>📊 {video.engagement_rate}% ER</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scores */}
      {analysis && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Performance Scores
              </h2>
              <p className="text-sm text-slate-500">
                AI-evaluated across 7 dimensions
              </p>
            </div>

            <ScoreRing
              score={analysis.overall_score}
              label="Overall"
              size="lg"
            />
          </div>

          <div className="space-y-3">
            {SCORE_METRICS.map(({ key, label, desc }) => (
              <ScoreBar
                key={key}
                score={analysis[key] as number | null}
                label={label}
                description={desc}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
