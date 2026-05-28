'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, RefreshCw, Trash2, ExternalLink, Loader2,
  TrendingUp, Zap, Heart, Eye, Target, BookOpen, Clock,
  ChevronDown, ChevronUp, Copy, Check,
} from 'lucide-react';
import Link from 'next/link';
import { videosApi } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Status helpers ───────────────────────────────────────────────────────────
const DONE = new Set(['completed', 'analyzed', 'done', 'success']);
const FAIL = new Set(['failed', 'error']);
const isDone = (s?: string | null) => !!s && DONE.has(s.toLowerCase());
const isFailed = (s?: string | null) => !!s && FAIL.has(s.toLowerCase());
const isPending = (s?: string | null) => !isDone(s) && !isFailed(s);

// ─── Score ring component ──────────────────────────────────────────────────────
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="36" y="40" textAnchor="middle" fill="white" fontSize="14" fontWeight="700"
          className="rotate-90" style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}>
          {Math.round(score)}
        </text>
      </svg>
      <span className="text-[10px] text-slate-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-bold text-white">{Math.round(score)}/100</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Expandable section ───────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-200">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-white/5 pt-4">{children}</div>}
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-white/8 text-slate-500 hover:text-slate-300 transition-all">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ─── JSON parse helper ────────────────────────────────────────────────────────
function parseJ(val: any): any {
  if (val == null) return null;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return val; } }
  return val;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const fetchVideo = useCallback(async () => {
    try {
      const res = await videosApi.get(id);
      // Backend wraps in { success, video: {...} }
      const v = res.data?.video ?? res.data?.data ?? res.data;
      setVideo(v);
      return v;
    } catch {
      toast.error('Video not found');
      router.push('/dashboard/history');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchVideo();
    return () => stopPoll();
  }, [fetchVideo, stopPoll]);

  // Poll only if pending (shouldn't happen with instant demo, but safety net)
  useEffect(() => {
    if (!video || isDone(video.status) || isFailed(video.status)) { stopPoll(); return; }
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      const updated = await fetchVideo();
      if (!updated) return;
      if (isDone(updated.status)) { stopPoll(); toast.success('Analysis complete!'); }
      else if (isFailed(updated.status)) { stopPoll(); toast.error('Analysis failed.'); }
    }, 3000);
    return () => stopPoll();
  }, [video?.status, fetchVideo, stopPoll]);

  const handleReanalyze = async () => {
    if (!video) return;
    setReanalyzing(true);
    try {
      const res = await videosApi.reanalyze(id);
      const newVideo = res.data?.video ?? res.data;
      if (newVideo?.id) {
        router.push(`/dashboard/video/${newVideo.id}`);
      } else {
        toast.success('Re-analysis started!');
        await fetchVideo();
      }
    } catch {
      toast.error('Failed to re-analyze');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this video and all analysis data?')) return;
    try {
      await videosApi.delete(id);
      toast.success('Deleted');
      router.push('/dashboard/history');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-slate-500 text-sm">Loading analysis...</p>
      </div>
    </div>
  );

  if (!video) return null;

  const a = video.analysis || {};
  const status = video.status || 'completed';

  const scores = [
    { label: 'Hook', key: 'hook_score', color: '#6366f1', icon: Zap },
    { label: 'Viral', key: 'viral_score', color: '#10b981', icon: TrendingUp },
    { label: 'Retention', key: 'retention_score', color: '#06b6d4', icon: Eye },
    { label: 'Emotion', key: 'emotion_score', color: '#f59e0b', icon: Heart },
    { label: 'Storytelling', key: 'storytelling_score', color: '#8b5cf6', icon: BookOpen },
    { label: 'CTA', key: 'cta_score', color: '#f43f5e', icon: Target },
    { label: 'Pacing', key: 'pacing_score', color: '#ec4899', icon: Clock },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/history"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>
        <div className="flex items-center gap-2">
          <a href={video.original_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 text-slate-400 hover:text-white text-xs font-medium transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> View Original
          </a>
          {(isDone(status) || isFailed(status)) && (
            <button onClick={handleReanalyze} disabled={reanalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 text-slate-400 hover:text-white text-xs font-medium transition-all disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
              {isFailed(status) ? 'Retry' : 'Re-analyze'}
            </button>
          )}
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-medium transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Pending */}
      {isPending(status) && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Analyzing...</h2>
          <p className="text-slate-400 text-sm">Should complete in seconds.</p>
        </div>
      )}

      {/* Failed */}
      {isFailed(status) && (
        <div className="glass-card rounded-2xl p-8 text-center border-rose-500/20">
          <p className="text-rose-400 font-semibold mb-2">Analysis Failed</p>
          <button onClick={handleReanalyze}
            className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors">
            Retry Analysis
          </button>
        </div>
      )}

      {/* Full analysis */}
      {isDone(status) && (
        <div className="space-y-5">
          {/* Video header card */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex gap-5">
              {video.thumbnail_url && (
                <img src={video.thumbnail_url} alt={video.title}
                  className="w-40 h-24 object-cover rounded-xl flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-medium capitalize">
                    {video.platform}
                  </span>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    ✓ Analyzed
                  </span>
                </div>
                <h1 className="text-lg font-bold text-white leading-tight line-clamp-2">{video.title}</h1>
                <p className="text-sm text-slate-500 mt-1">{video.creator_name} · {video.creator_handle}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                  {video.views && <span>{(video.views / 1000).toFixed(0)}K views</span>}
                  {video.likes && <span>{(video.likes / 1000).toFixed(1)}K likes</span>}
                  {video.comments && <span>{video.comments.toLocaleString()} comments</span>}
                  {video.duration && <span>{Math.floor(video.duration / 60)}m {video.duration % 60}s</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Overall score + all scores */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-black text-white font-display">
                  {Math.round(a.overall_score ?? 0)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Overall Score</div>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-3">
                {scores.slice(0, 4).map(({ label, key, color }) => (
                  <ScoreRing key={key} score={a[key] ?? 0} label={label} color={color} />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {scores.map(({ label, key, color }) => (
                <ScoreBar key={key} label={label} score={a[key] ?? 0} color={color} />
              ))}
            </div>
          </div>

          {/* Executive Summary */}
          {a.executive_summary && (
            <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-indigo-500/5">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Executive Summary</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{a.executive_summary}</p>
            </div>
          )}

          {/* Key Strengths + Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parseJ(a.key_strengths)?.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">✓ Key Strengths</h3>
                <ul className="space-y-2">
                  {parseJ(a.key_strengths).map((s: string, i: number) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 flex-shrink-0">·</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {parseJ(a.improvement_areas)?.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">⚡ Improvement Areas</h3>
                <ul className="space-y-2">
                  {parseJ(a.improvement_areas).map((s: string, i: number) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 flex-shrink-0">·</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Plan */}
          {parseJ(a.action_plan)?.length > 0 && (
            <Section title="Action Plan" icon={Target} defaultOpen>
              <div className="space-y-3">
                {parseJ(a.action_plan).map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                      item.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400' :
                      item.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>{item.priority || 'TODO'}</span>
                    <div>
                      <p className="text-sm text-slate-200">{item.action || item}</p>
                      {item.timeline && <p className="text-xs text-slate-600 mt-0.5">{item.timeline}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Hook + Viral + Retention detailed analysis */}
          <Section title="Hook Analysis" icon={Zap} defaultOpen>
            <p className="text-sm text-slate-300 leading-relaxed">{a.hook_analysis}</p>
          </Section>
          <Section title="Viral Analysis" icon={TrendingUp}>
            <p className="text-sm text-slate-300 leading-relaxed">{a.viral_analysis}</p>
          </Section>
          <Section title="Retention Analysis" icon={Eye}>
            <p className="text-sm text-slate-300 leading-relaxed">{a.retention_analysis}</p>
          </Section>
          <Section title="Emotional Triggers" icon={Heart}>
            {parseJ(a.emotional_triggers)?.length > 0 ? (
              <ul className="space-y-2">
                {parseJ(a.emotional_triggers).map((t: string, i: number) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400">🔥</span>{t}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-300">{a.emotion_analysis}</p>}
          </Section>

          {/* Script Improvements */}
          {(a.improved_hook || a.improved_cta || a.improved_script) && (
            <Section title="Script Improvements" icon={BookOpen}>
              <div className="space-y-4">
                {a.improved_hook && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Optimized Hook</h4>
                      <CopyButton text={a.improved_hook} />
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <p className="text-sm text-slate-300 italic">{a.improved_hook}</p>
                    </div>
                  </div>
                )}
                {a.improved_cta && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Optimized CTA</h4>
                      <CopyButton text={a.improved_cta} />
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-slate-300 italic">{a.improved_cta}</p>
                    </div>
                  </div>
                )}
                {a.improved_script && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Full Optimized Script</h4>
                      <CopyButton text={a.improved_script} />
                    </div>
                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 max-h-64 overflow-y-auto">
                      <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{a.improved_script}</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Target Audience */}
          {parseJ(a.target_audience) && (
            <Section title="Target Audience" icon={Target}>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(parseJ(a.target_audience) || {}).map(([k, v]: [string, any]) => (
                  <div key={k} className="p-3 rounded-xl bg-white/3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{k.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-300">{Array.isArray(v) ? v.join(', ') : String(v)}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Viral Elements */}
          {parseJ(a.viral_elements)?.length > 0 && (
            <Section title="Viral Elements" icon={TrendingUp}>
              <ul className="space-y-2">
                {parseJ(a.viral_elements).map((el: string, i: number) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400">🚀</span>{el}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* CTA + Storytelling + Pacing */}
          <Section title="CTA Analysis" icon={Target}>
            <p className="text-sm text-slate-300 leading-relaxed">{a.cta_analysis}</p>
          </Section>
          <Section title="Storytelling & Pacing" icon={BookOpen}>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{a.storytelling_analysis}</p>
            {parseJ(a.storytelling_structure) && (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {Object.entries(parseJ(a.storytelling_structure) || {}).map(([k, v]: [string, any]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className="text-slate-500 uppercase tracking-wider flex-shrink-0 w-20">{k.replace(/_/g, ' ')}</span>
                    <span className="text-slate-300">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
