'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Video, Zap, MessageSquare, BarChart3,
  ArrowRight, Plus, GitCompare, Cpu, Star,
} from 'lucide-react';
import { dashboardApi, videosApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const PLATFORM_COLOR: Record<string, string> = {
  youtube: '#ff0000', tiktok: '#00f2ea', instagram: '#e1306c',
};

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

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

// ─── Mini score ring ──────────────────────────────────────────────────────────
function MiniRing({ score }: { score: number }) {
  const r = 14, circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : '#f59e0b';
  return (
    <svg width="36" height="36" className="-rotate-90">
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" />
      <text x="18" y="22" textAnchor="middle" fill="white" fontSize="9" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '18px 18px' }}>
        {Math.round(score)}
      </text>
    </svg>
  );
}

// ─── Video row ────────────────────────────────────────────────────────────────
function VideoRow({ video }: { video: any }) {
  const pColor = PLATFORM_COLOR[video.platform] || '#6366f1';
  const score = video.analysis?.overall_score ?? video.overall_score;
  return (
    <Link href={`/dashboard/video/${video.id}`}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/4 transition-colors group">
      {video.thumbnail_url
        ? <img src={video.thumbnail_url} alt="" className="w-12 h-8 rounded-lg object-cover flex-shrink-0" />
        : <div className="w-12 h-8 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center">
            <Video className="w-3 h-3 text-slate-600" />
          </div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">
          {video.title || 'Untitled'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px]" style={{ color: pColor }}>{video.platform}</span>
          <span className="text-[10px] text-slate-600">{formatRelative(video.created_at)}</span>
        </div>
      </div>
      {score != null && <MiniRing score={score} />}
    </Link>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white font-display">{value}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      videosApi.list({ page_size: 5 }),
    ])
      .then(([statsRes, videosRes]) => {
        setStats(statsRes.data);
        setRecentVideos(videosRes.data?.videos || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Backend returns flat structure:
  // { total_videos, avg_viral_score, avg_engagement_rate, credits_used,
  //   credits_remaining, weekly_growth, recent_videos, ... }
  const totalVideos = stats?.total_videos ?? 0;
  const avgScore = stats?.avg_viral_score ? `${Math.round(stats.avg_viral_score)}` : '—';
  const creditsLeft = stats?.credits_remaining ?? (user ? 1000 - (user.credits_used || 0) : '—');
  const weeklyGrowth = stats?.weekly_growth;

  // Radar: use stats averages if available, else fallback
  const radarData = [
    { metric: 'Hook',    value: stats?.avg_hook_score ?? stats?.avg_viral_score ?? 85 },
    { metric: 'Viral',   value: stats?.avg_viral_score ?? 88 },
    { metric: 'Retain',  value: stats?.avg_retention_score ?? stats?.avg_viral_score ?? 82 },
    { metric: 'Emotion', value: stats?.avg_emotion_score ?? stats?.avg_viral_score ?? 80 },
    { metric: 'Overall', value: stats?.avg_viral_score ?? 84 },
  ];

  // Platform breakdown from recent videos
  const platformCounts: Record<string, number> = {};
  recentVideos.forEach((v) => {
    platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1;
  });
  const platformData = Object.entries(platformCounts).map(([platform, count]) => ({ platform, count }));

  // Top 5 by score
  const topVideos = [...recentVideos]
    .sort((a, b) => (b.analysis?.overall_score ?? 0) - (a.analysis?.overall_score ?? 0))
    .slice(0, 5);

  const QUICK_ACTIONS = [
    { href: '/dashboard/analyze', icon: Plus, label: 'Analyze Video', desc: 'Add a new video URL', color: '#6366f1' },
    { href: '/dashboard/chat', icon: MessageSquare, label: 'AI Chat', desc: 'Ask about your content', color: '#8b5cf6' },
    { href: '/dashboard/compare', icon: GitCompare, label: 'Compare', desc: 'Side-by-side analysis', color: '#06b6d4' },
    { href: '/dashboard/agents', icon: Cpu, label: 'AI Agents', desc: 'Specialized deep analysis', color: '#10b981' },
  ];

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-52 bg-white/5 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 h-28 animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Welcome back, {user?.full_name?.split(' ')[0] || user?.username || 'Creator'} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your creator intelligence overview</p>
        </div>
        <Link
          href="/dashboard/analyze"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" /> Analyze Video
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Videos" value={totalVideos} icon={Video} color="#6366f1" />
        <StatCard label="Avg Viral Score" value={avgScore} icon={TrendingUp} color="#10b981" />
        <StatCard
          label="Weekly Growth"
          value={weeklyGrowth ? `+${weeklyGrowth}%` : '—'}
          icon={BarChart3}
          color="#f59e0b"
        />
        <StatCard label="Credits Left" value={creditsLeft} icon={Zap} color="#8b5cf6" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, color }) => (
          <Link key={href} href={href}
            className="glass-card rounded-2xl p-4 hover:border-white/10 hover:bg-white/4 transition-all hover:-translate-y-0.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{label}</p>
            <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {totalVideos === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center border border-indigo-500/10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Analyze your first video</h2>
          <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
            Paste any YouTube, TikTok, or Instagram Reel URL to get instant AI analysis with hook scores,
            viral potential, and a full improvement plan.
          </p>
          <Link href="/dashboard/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Analyze a Video
          </Link>
        </div>
      )}

      {/* Charts */}
      {totalVideos > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar name="Avg Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Videos by Platform</h3>
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={platformData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="platform" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
                Analyze videos to see platform breakdown
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent + Top performers */}
      {totalVideos > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">Recent Videos</h3>
              <Link href="/dashboard/history"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1">
              {recentVideos.length === 0 ? (
                <p className="text-slate-600 text-sm text-center py-6">No videos yet</p>
              ) : (
                recentVideos.map((v) => <VideoRow key={v.id} video={v} />)
              )}
            </div>
          </div>

          {/* Top performers */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">Top Performers</h3>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-1">
              {topVideos.length === 0 ? (
                <p className="text-slate-600 text-sm text-center py-6">
                  Analyze videos to see top performers
                </p>
              ) : (
                topVideos.map((v, i) => (
                  <Link key={v.id} href={`/dashboard/video/${v.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/4 transition-colors group">
                    <span className="text-base font-black text-slate-700 w-5 text-center">#{i + 1}</span>
                    {v.thumbnail_url
                      ? <img src={v.thumbnail_url} alt="" className="w-12 h-8 rounded-lg object-cover flex-shrink-0" />
                      : <div className="w-12 h-8 rounded-lg bg-white/5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                        {v.title || 'Untitled'}
                      </p>
                      <p className="text-[10px] text-slate-600">{v.platform}</p>
                    </div>
                    {(v.analysis?.overall_score ?? v.overall_score) != null && (
                      <MiniRing score={v.analysis?.overall_score ?? v.overall_score} />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
