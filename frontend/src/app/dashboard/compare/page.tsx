'use client';

import { useEffect, useState } from 'react';
import { GitCompare, Loader2, Trophy, TrendingUp, X } from 'lucide-react';
import { comparisonApi, videosApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const PLATFORM_COLOR: Record<string, string> = {
  youtube: '#ff0000', tiktok: '#000000', instagram: '#e1306c',
};

function ScoreCell({ score }: { score: number | undefined }) {
  if (score == null) return <span className="text-slate-600 text-xs">—</span>;
  const s = Math.round(score);
  const color = s >= 80 ? '#10b981' : s >= 60 ? '#06b6d4' : s >= 40 ? '#f59e0b' : '#f43f5e';
  return <span className="text-xs font-bold" style={{ color }}>{s}</span>;
}

export default function ComparePage() {
  const [myVideos, setMyVideos] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    // Use the dedicated comparison endpoint for the video list
    comparisonApi.myVideos()
      .then((res) => setMyVideos(res.data.videos || []))
      .catch(() =>
        // Fallback to regular videos list
        videosApi.list({ page_size: 50 })
          .then((res) => setMyVideos(res.data.videos || []))
      )
      .finally(() => setLoadingVideos(false));
  }, []);

  const toggleVideo = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 5) { toast.error('Max 5 videos'); return prev; }
      return [...prev, id];
    });
    setResult(null);
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) { toast.error('Select at least 2 videos'); return; }
    setLoading(true);
    try {
      const res = await comparisonApi.compare(selectedIds);
      setResult(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  // Build radar data from result.videos (each has .analysis.{metric})
  const radarData = result?.videos
    ? [
        { metric: 'Hook',      ...Object.fromEntries(result.videos.map((v: any, i: number) => [`v${i}`, v.analysis?.hook_score ?? 0])) },
        { metric: 'Viral',     ...Object.fromEntries(result.videos.map((v: any, i: number) => [`v${i}`, v.analysis?.viral_score ?? 0])) },
        { metric: 'Retention', ...Object.fromEntries(result.videos.map((v: any, i: number) => [`v${i}`, v.analysis?.retention_score ?? 0])) },
        { metric: 'Emotion',   ...Object.fromEntries(result.videos.map((v: any, i: number) => [`v${i}`, v.analysis?.emotion_score ?? 0])) },
        { metric: 'Story',     ...Object.fromEntries(result.videos.map((v: any, i: number) => [`v${i}`, v.analysis?.storytelling_score ?? 0])) },
      ]
    : [];

  // Bar chart: overall scores
  const barData = result?.videos?.map((v: any, i: number) => ({
    name: (v.title || `Video ${i + 1}`).slice(0, 20),
    score: Math.round(v.analysis?.overall_score ?? 0),
  })) ?? [];

  const comparison = result?.comparison || {};
  const winner = comparison.winner_title || comparison.winner || null;
  const winnerReason = comparison.winner_reason || '';
  const recommendations = comparison.recommendations || [];
  const headToHead = comparison.head_to_head || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Compare Videos</h1>
        <p className="text-slate-500 text-sm mt-1">Select 2–5 analyzed videos to compare side by side</p>
      </div>

      {/* Video selector */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">
            Select Videos ({selectedIds.length}/5)
          </h3>
          {selectedIds.length >= 2 && (
            <button
              onClick={handleCompare}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-60"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <GitCompare className="w-4 h-4" />}
              Compare
            </button>
          )}
        </div>

        {loadingVideos ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : myVideos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-600 text-sm">No analyzed videos yet.</p>
            <a href="/dashboard/analyze" className="text-indigo-400 text-sm hover:underline mt-1 inline-block">
              Analyze your first video →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-80 overflow-y-auto">
            {myVideos.map((v) => {
              const selected = selectedIds.includes(v.id);
              const idx = selectedIds.indexOf(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVideo(v.id)}
                  className={`relative text-left p-3 rounded-xl border transition-all ${
                    selected
                      ? 'border-indigo-500/40 bg-indigo-500/10'
                      : 'border-white/6 bg-white/3 hover:border-white/12 hover:bg-white/5'
                  }`}
                >
                  {selected && (
                    <div
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: COLORS[idx] }}
                    >
                      {idx + 1}
                    </div>
                  )}
                  {v.thumbnail_url && (
                    <img src={v.thumbnail_url} alt="" className="w-full aspect-video object-cover rounded-lg mb-2" />
                  )}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-snug">{v.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px]" style={{ color: PLATFORM_COLOR[v.platform] || '#6366f1' }}>
                      {v.platform}
                    </span>
                    {(v.overall_score ?? v.analysis?.overall_score) != null && (
                      <span className="text-[10px] font-bold text-indigo-400">
                        {Math.round(v.overall_score ?? v.analysis?.overall_score)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Winner banner */}
          {winner && (
            <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <Trophy className="w-8 h-8 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-400/60 font-medium uppercase tracking-wider">Winner</p>
                  <h3 className="text-base font-semibold text-white">{winner}</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{winnerReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {radarData.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Performance Radar</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                    {result.videos.map((v: any, i: number) => (
                      <Radar
                        key={i}
                        name={(v.title || `Video ${i + 1}`).slice(0, 18)}
                        dataKey={`v${i}`}
                        stroke={COLORS[i]}
                        fill={COLORS[i]}
                        fillOpacity={0.08}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend formatter={(val) => <span style={{ fontSize: 10, color: '#94a3b8' }}>{val}</span>} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {barData.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Overall Scores</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0' }} />
                    {barData.map((_: any, i: number) => (
                      <Bar key={i} dataKey="score" fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Score table */}
          <div className="glass-card rounded-2xl p-5 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Score Breakdown</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-slate-500 pb-3 pr-6">Metric</th>
                  {result.videos.map((v: any, i: number) => (
                    <th key={i} className="text-right pb-3 px-3">
                      <span className="text-xs font-medium" style={{ color: COLORS[i] }}>
                        {(v.title || `Video ${i + 1}`).slice(0, 18)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {['overall_score', 'hook_score', 'viral_score', 'retention_score', 'emotion_score', 'storytelling_score', 'cta_score'].map((metric) => (
                  <tr key={metric}>
                    <td className="py-2.5 pr-6 text-xs text-slate-500 capitalize">
                      {metric.replace('_score', '').replace('_', ' ')}
                    </td>
                    {result.videos.map((v: any, i: number) => (
                      <td key={i} className="text-right px-3 py-2.5">
                        <ScoreCell score={v.analysis?.[metric]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Head-to-head */}
          {headToHead.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Head-to-Head</h3>
              <div className="space-y-3">
                {headToHead.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-500">{item.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 max-w-[180px] truncate">{item.winner}</span>
                      <span className="text-xs text-emerald-400 font-mono">{item.margin}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {recommendations.map((r: string, i: number) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
