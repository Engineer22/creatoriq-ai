'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, Heart, MessageCircle, Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { Video, formatNumber, formatDuration, platformColor } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
  onDelete?: (id: string) => void;
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-amber-400', label: 'Queued' },
  processing: { icon: Loader2, color: 'text-blue-400', label: 'Analyzing...', spin: true },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Ready' },
  failed: { icon: XCircle, color: 'text-rose-400', label: 'Failed' },
};

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const statusConfig = STATUS_CONFIG[video.status];
  const StatusIcon = statusConfig.icon;
  const pColor = platformColor(video.platform);

  return (
    <Link href={`/dashboard/video/${video.id}`} className="block group">
      <div className={cn(
        'glass-card rounded-xl overflow-hidden transition-all duration-200',
        'hover:border-white/10 hover:bg-white/4 hover:-translate-y-0.5 hover:shadow-xl',
        'hover:shadow-indigo-500/5'
      )}>
        {/* Thumbnail */}
        <div className="relative aspect-video bg-white/3 overflow-hidden">
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title || 'Video thumbnail'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
              <Zap className="w-10 h-10 text-indigo-400/40" />
            </div>
          )}

          {/* Platform badge */}
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
            style={{ background: `${pColor}20`, color: pColor, border: `1px solid ${pColor}30` }}
          >
            {video.platform}
          </div>

          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-mono">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Status overlay for non-completed */}
          {video.status !== 'completed' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className={cn('flex items-center gap-2 text-sm font-medium', statusConfig.color)}>
                <StatusIcon className={cn('w-4 h-4', 'spin' in statusConfig && statusConfig.spin && 'animate-spin')} />
                {statusConfig.label}
              </div>
            </div>
          )}

          {/* Score overlay for completed */}
          {video.status === 'completed' && video.analysis?.overall_score !== null && (
            <div className="absolute top-2 right-2">
              <ScoreRing score={video.analysis?.overall_score ?? null} label="" size="sm" showLabel={false} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug mb-2 group-hover:text-white transition-colors">
            {video.title || 'Untitled Video'}
          </h3>

          {video.creator_name && (
            <p className="text-xs text-slate-500 mb-2 truncate">@{video.creator_handle || video.creator_name}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {video.views !== null && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(video.views)}
              </span>
            )}
            {video.likes !== null && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {formatNumber(video.likes)}
              </span>
            )}
            {video.comments !== null && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {formatNumber(video.comments)}
              </span>
            )}
          </div>

          {/* Analysis scores mini-bar */}
          {video.status === 'completed' && video.analysis && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: 'Hook', score: video.analysis.hook_score },
                  { label: 'Viral', score: video.analysis.viral_score },
                  { label: 'Retain', score: video.analysis.retention_score },
                  { label: 'Emot.', score: video.analysis.emotion_score },
                ].map(({ label, score }) => (
                  <div key={label} className="text-center">
                    <div className="text-[10px] text-slate-500 mb-0.5">{label}</div>
                    <div
                      className="text-xs font-bold"
                      style={{ color: score !== null ? (score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e') : '#64748b' }}
                    >
                      {score !== null ? Math.round(score) : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-600 mt-2">{formatRelativeTime(video.created_at)}</p>
        </div>
      </div>
    </Link>
  );
}
