'use client';

import { useState } from 'react';
import { Video, ActionPlanItem } from '@/types';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { formatNumber, formatDuration, platformColor } from '@/types';
import {
  CheckCircle2, TrendingUp, Target, Lightbulb, Wand2,
  ChevronDown, ChevronRight, Star, AlertTriangle, Download
} from 'lucide-react';
import { exportApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const SCORE_METRICS = [
  { key: 'hook_score', label: 'Hook', desc: 'First-impression & attention capture' },
  { key: 'retention_score', label: 'Retention', desc: 'Ability to keep viewers watching' },
  { key: 'emotion_score', label: 'Emotion', desc: 'Emotional resonance & depth' },
  { key: 'viral_score', label: 'Viral Potential', desc: 'Shareability & reach potential' },
  { key: 'storytelling_score', label: 'Storytelling', desc: 'Narrative structure & arc' },
  { key: 'cta_score', label: 'CTA', desc: 'Call-to-action effectiveness' },
  { key: 'pacing_score', label: 'Pacing', desc: 'Energy, cuts & information density' },
] as const;

interface Props { video: Video }

export function VideoAnalysisDetail({ video }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'deep-dive' | 'improvements' | 'script'>('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const analysis = video.analysis;
  const pColor = platformColor(video.platform);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await exportApi.downloadPDF(video.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creatoriq-${video.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Could not download report');
    } finally {
      setDownloadingPdf(false);
    }
  };

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
              <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: `${pColor}20`, color: pColor }}>
                {video.platform.toUpperCase()}
              </span>
              {video.creator_handle && (
                <span className="text-xs text-slate-500">@{video.creator_handle}</span>
              )}
            </div>
            <h1 className="text-lg font-semibold text-white mb-2 line-clamp-2">{video.title}</h1>
            <div className="flex items-center flex-wrap gap-4 text-xs text-slate-500">
              {video.views && <span>👁 {formatNumber(video.views)} views</span>}
              {video.likes && <span>❤️ {formatNumber(video.likes)} likes</span>}
              {video.comments && <span>💬 {formatNumber(video.comments)} comments</span>}
              {video.duration && <span>⏱ {formatDuration(video.duration)}</span>}
              {video.engagement_rate && <span>📊 {video.engagement_rate}% ER</span>}
            </div>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 text-slate-400 hover:text-white text-xs font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingPdf ? 'Generating...' : 'PDF Report'}
          </button>
        </div>
      </div>

      {/* Overall score + radar */}
      {analysis && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Performance Scores</h2>
              <p className="text-sm text-slate-500">AI-evaluated across 7 dimensions</p>
            </div>
            <ScoreRing score={analysis.overall_score} label="Overall" size="lg" />
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

      {/* Tabs */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-3.5 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'text-indigo-400 border-b-2 border-indigo-500 -mb-px bg-indigo-500/5'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && analysis && (
            <div className="space-y-6">
              {analysis.executive_summary && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" /> Executive Summary
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{analysis.executive_summary}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.key_strengths && analysis.key_strengths.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.key_strengths.map((s, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.improvement_areas && analysis.improvement_areas.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                      {analysis.improvement_areas.map((a, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Emotional triggers + viral elements */}
              <div className="grid grid-cols-2 gap-4">
                {analysis.emotional_triggers && analysis.emotional_triggers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Emotional Triggers</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.emotional_triggers.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs border border-violet-500/20">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.viral_elements && analysis.viral_elements.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Viral Elements</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.viral_elements.map((e, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20">{e}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Target audience */}
              {analysis.target_audience && (
                <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" /> Target Audience
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">
                    <span className="text-slate-300 font-medium">Demographic: </span>
                    {analysis.target_audience.primary_demographic}
                  </p>
                  {analysis.target_audience.interests && (
                    <p className="text-sm text-slate-400 mb-2">
                      <span className="text-slate-300 font-medium">Interests: </span>
                      {analysis.target_audience.interests.join(', ')}
                    </p>
                  )}
                  {analysis.target_audience.psychographic_profile && (
                    <p className="text-sm text-slate-500 italic">{analysis.target_audience.psychographic_profile}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Deep Dive Tab */}
          {activeTab === 'deep-dive' && analysis && (
            <div className="space-y-3">
              {SCORE_METRICS.map(({ key, label }) => {
                const analysisKey = `${key.replace('_score', '')}_analysis` as keyof typeof analysis;
                const analysisText = analysis[analysisKey] as string | null;
                const score = analysis[key] as number | null;
                if (!analysisText) return null;
                const isOpen = expandedSection === key;
                return (
                  <div key={key} className="rounded-xl border border-white/6 overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-200">{label} Analysis</span>
                        {score !== null && (
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">{Math.round(score)}/100</span>
                        )}
                      </div>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                        {analysisText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Plan Tab */}
          {activeTab === 'improvements' && analysis && (
            <div className="space-y-4">
              {analysis.action_plan && analysis.action_plan.length > 0 ? (
                <>
                  <p className="text-sm text-slate-500">AI-generated action plan to improve this video's performance:</p>
                  {analysis.action_plan.map((item: ActionPlanItem, i) => (
                    <div key={i} className={cn(
                      'rounded-xl p-4 border',
                      item.priority === 'high' ? 'border-rose-500/20 bg-rose-500/5' :
                      item.priority === 'medium' ? 'border-amber-500/20 bg-amber-500/5' :
                      'border-slate-700 bg-white/2'
                    )}>
                      <div className="flex items-start gap-3">
                        <span className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex-shrink-0 mt-0.5',
                          item.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                          item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-700 text-slate-400'
                        )}>
                          {item.priority}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-200 mb-1">{item.action}</p>
                          <p className="text-xs text-slate-500">
                            <span className="text-emerald-400">Impact:</span> {item.impact}
                            <span className="ml-3 text-slate-600">⏱ {item.timeframe}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-slate-500">No action plan available.</p>
              )}

              {/* Improved hook + CTA */}
              {analysis.improved_hook && (
                <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                    <Wand2 className="w-4 h-4" /> Improved Hook
                  </h3>
                  <p className="text-sm text-slate-300 italic leading-relaxed">"{analysis.improved_hook}"</p>
                </div>
              )}

              {analysis.improved_cta && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <h3 className="text-sm font-semibold text-violet-400 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Improved CTA
                  </h3>
                  <p className="text-sm text-slate-300 italic leading-relaxed">"{analysis.improved_cta}"</p>
                </div>
              )}
            </div>
          )}

          {/* Script Tab */}
          {activeTab === 'script' && analysis && (
            <div>
              {analysis.improved_script ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white">AI-Optimized Script</h3>
                      <p className="text-xs text-slate-500">Rewritten for maximum engagement while preserving your voice</p>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(analysis.improved_script!); toast.success('Script copied!'); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20"
                    >
                      Copy Script
                    </button>
                  </div>
                  <div className="bg-white/3 rounded-xl p-5 border border-white/6">
                    <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">{analysis.improved_script}</pre>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No improved script available. This may be because no transcript was found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
