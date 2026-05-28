'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, Filter, Trash2, ExternalLink, TrendingUp,
  Eye, Heart, MessageCircle, Clock, LayoutGrid,
  LayoutList, Loader2, Video, Plus, RefreshCw,
} from 'lucide-react';
import { videosApi } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatNum(n: number | undefined | null) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function formatRelative(iso: string | undefined) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PLATFORM_COLOR: Record<string, string> = {
  youtube: '#ff4444',
  tiktok: '#00f2ea',
  instagram: '#e1306c',
  twitter: '#1da1f2',
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
};

function scoreColor(score: number | undefined) {
  if (score == null) return '#64748b';
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#6366f1';
  if (score >= 55) return '#f59e0b';
  return '#f43f5e';
}

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score, label }: { score: number | undefined; label: string }) {
  const color = scoreColor(score);
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-bold" style={{ color }}>
        {score != null ? Math.round(score) : '—'}
      </span>
      <span className="text-[9px] text-slate-600 mt-0.5">{label}</span>
    </div>
  );
}

// ─── Mini score ring ──────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number | undefined }) {
  if (score == null) return null;
  const r = 16, circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <svg width="42" height="42" className="-rotate-90 flex-shrink-0">
      <circle cx="21" cy="21" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
      <circle
        cx="21" cy="21" r={r} fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
      />
      <text
        x="21" y="25" textAnchor="middle" fill="white" fontSize="10" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '21px 21px' }}
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    analyzed:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    processing:'text-blue-400 bg-blue-400/10 border-blue-400/20',
    pending:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
    failed:    'text-rose-400 bg-rose-400/10 border-rose-400/20',
    error:     'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };
  const cls = map[status?.toLowerCase()] || 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {status || 'unknown'}
    </span>
  );
}

// ─── Grid card ────────────────────────────────────────────────────────────────
function VideoCard({ video, onDelete }: { video: any; onDelete: (id: string) => void }) {
  const a = video.analysis || {};
  const pColor = PLATFORM_COLOR[video.platform] || '#6366f1';

  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:border-white/10 transition-all hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-white/5 overflow-hidden">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-8 h-8 text-slate-700" />
          </div>
        )}

        {/* Platform badge */}
        <div
          className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: `${pColor}cc` }}
        >
          {PLATFORM_LABELS[video.platform] || video.platform}
        </div>

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/70 text-white flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
          </div>
        )}

        {/* Hover overlay actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link
            href={`/dashboard/video/${video.id}`}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            View Analysis
          </Link>
          <a
            href={video.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/dashboard/video/${video.id}`} className="hover:text-indigo-300 transition-colors">
            <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 leading-snug">
              {video.title || 'Untitled Video'}
            </h3>
          </Link>
          <ScoreRing score={a.overall_score} />
        </div>

        {video.creator_name && (
          <p className="text-xs text-slate-500 mb-2 truncate">
            {video.creator_name} {video.creator_handle ? `· ${video.creator_handle}` : ''}
          </p>
        )}

        {/* Metrics row */}
        <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
          {video.views != null && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {formatNum(video.views)}
            </span>
          )}
          {video.likes != null && (
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {formatNum(video.likes)}
            </span>
          )}
          {video.comments != null && (
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> {formatNum(video.comments)}
            </span>
          )}
        </div>

        {/* Score row */}
        {a.hook_score != null && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <ScoreBadge score={a.hook_score} label="Hook" />
            <ScoreBadge score={a.viral_score} label="Viral" />
            <ScoreBadge score={a.retention_score} label="Retain" />
            <ScoreBadge score={a.cta_score} label="CTA" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <StatusPill status={video.status} />
            <span className="text-[10px] text-slate-600">{formatRelative(video.created_at)}</span>
          </div>
          <button
            onClick={() => onDelete(video.id)}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── List row ─────────────────────────────────────────────────────────────────
function VideoRow({ video, onDelete }: { video: any; onDelete: (id: string) => void }) {
  const a = video.analysis || {};
  const pColor = PLATFORM_COLOR[video.platform] || '#6366f1';

  return (
    <div className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/3 border border-transparent hover:border-white/6 transition-all">
      {/* Thumbnail */}
      {video.thumbnail_url ? (
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-20 h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-12 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center">
          <Video className="w-4 h-4 text-slate-700" />
        </div>
      )}

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <Link href={`/dashboard/video/${video.id}`}>
          <h3 className="text-sm font-medium text-slate-300 hover:text-white transition-colors truncate">
            {video.title || 'Untitled Video'}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-medium" style={{ color: pColor }}>
            {PLATFORM_LABELS[video.platform] || video.platform}
          </span>
          {video.creator_name && (
            <span className="text-[10px] text-slate-600">· {video.creator_name}</span>
          )}
          <span className="text-[10px] text-slate-700">{formatRelative(video.created_at)}</span>
        </div>
      </div>

      {/* Engagement */}
      <div className="hidden md:flex items-center gap-4 text-xs text-slate-600 flex-shrink-0">
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNum(video.views)}</span>
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNum(video.likes)}</span>
      </div>

      {/* Scores */}
      <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
        <ScoreBadge score={a.hook_score} label="Hook" />
        <ScoreBadge score={a.viral_score} label="Viral" />
        <ScoreBadge score={a.retention_score} label="Retain" />
        <ScoreBadge score={a.overall_score} label="Overall" />
      </div>

      {/* Status */}
      <div className="hidden sm:block flex-shrink-0">
        <StatusPill status={video.status} />
      </div>

      {/* Overall ring */}
      <ScoreRing score={a.overall_score} />

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <a
          href={video.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-white/8 text-slate-600 hover:text-slate-300 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={() => onDelete(video.id)}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const PLATFORMS = ['all', 'youtube', 'tiktok', 'instagram'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'score_desc', label: 'Highest score' },
  { value: 'score_asc', label: 'Lowest score' },
  { value: 'views_desc', label: 'Most views' },
];

export default function HistoryPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 12;

  const fetchVideos = useCallback(async (pg = 1, showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params: any = { page: pg, page_size: PAGE_SIZE };
      if (platform !== 'all') params.platform = platform;
      const res = await videosApi.list(params);
      const data = res.data;
      setVideos(data.videos || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      setPage(pg);
    } catch (err: any) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [platform]);

  useEffect(() => { fetchVideos(1); }, [platform]);

  // Client-side search + sort
  useEffect(() => {
    let result = [...videos];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          (v.title || '').toLowerCase().includes(q) ||
          (v.creator_name || '').toLowerCase().includes(q) ||
          (v.platform || '').toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aScore = a.analysis?.overall_score ?? 0;
      const bScore = b.analysis?.overall_score ?? 0;
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      switch (sort) {
        case 'newest':     return bDate - aDate;
        case 'oldest':     return aDate - bDate;
        case 'score_desc': return bScore - aScore;
        case 'score_asc':  return aScore - bScore;
        case 'views_desc': return (b.views || 0) - (a.views || 0);
        default:           return bDate - aDate;
      }
    });

    setFiltered(result);
  }, [videos, search, sort]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video and all its analysis data?')) return;
    try {
      await videosApi.delete(id);
      toast.success('Video deleted');
      setVideos((prev) => prev.filter((v) => v.id !== id));
      setTotal((t) => t - 1);
    } catch {
      toast.error('Failed to delete video');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Video Library</h1>
          <p className="text-slate-500 text-sm mt-1">
            {total > 0 ? `${total} analyzed video${total !== 1 ? 's' : ''}` : 'No videos yet'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchVideos(page, true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/8 text-slate-400 hover:text-white transition-all disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/dashboard/analyze"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Analyze Video
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, creator..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
          />
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-1 p-1 bg-white/4 rounded-xl border border-white/6">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                platform === p
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {p === 'all' ? 'All' : PLATFORM_LABELS[p] || p}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/8 rounded-xl text-xs text-slate-400 focus:outline-none focus:border-indigo-500/30 transition-colors"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/4 rounded-xl border border-white/6">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-2'
        }>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`bg-white/3 rounded-2xl animate-pulse border border-white/5 ${view === 'grid' ? 'h-72' : 'h-20'}`}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-slate-700" />
          </div>
          {search || platform !== 'all' ? (
            <>
              <h3 className="text-base font-semibold text-slate-400 mb-2">No videos match your filters</h3>
              <button
                onClick={() => { setSearch(''); setPlatform('all'); }}
                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-slate-400 mb-2">No videos yet</h3>
              <p className="text-slate-600 text-sm mb-5">Analyze your first video to see it here</p>
              <Link
                href="/dashboard/analyze"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" /> Analyze a Video
              </Link>
            </>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-3 space-y-1">
          {/* List header */}
          <div className="hidden lg:flex items-center gap-4 px-3.5 pb-2 border-b border-white/5">
            <div className="w-20 flex-shrink-0" />
            <span className="flex-1 text-[10px] text-slate-600 uppercase tracking-wider">Title</span>
            <div className="hidden md:flex gap-4 flex-shrink-0 w-28">
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">Views</span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">Likes</span>
            </div>
            <div className="hidden lg:flex gap-4 flex-shrink-0 w-56 justify-around">
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">Hook</span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">Viral</span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">Retain</span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">Score</span>
            </div>
            <div className="flex-shrink-0 w-24" />
          </div>
          {filtered.map((v) => (
            <VideoRow key={v.id} video={v} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && !search && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => fetchVideos(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/8 text-slate-400 hover:text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => fetchVideos(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    p === page
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-white hover:bg-white/8'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => fetchVideos(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/8 text-slate-400 hover:text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Result count */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-xs text-slate-700">
          Showing {filtered.length} of {total} video{total !== 1 ? 's' : ''}
          {search ? ` matching "${search}"` : ''}
        </p>
      )}
    </div>
  );
}
