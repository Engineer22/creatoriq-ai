'use client';

import { useEffect, useState } from 'react';
import { Cpu, Play, Loader2, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { videosApi, agentsApi } from '@/lib/api';
import toast from 'react-hot-toast';

function cn(...c: (string | boolean | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

// ─── Recursive result renderer ─────────────────────────────────────────────────
function ResultValue({ value, depth = 0 }: { value: any; depth?: number }) {
  if (value == null) return <span className="text-slate-600">—</span>;
  if (typeof value === 'boolean')
    return <span className={value ? 'text-emerald-400' : 'text-rose-400'}>{String(value)}</span>;
  if (typeof value === 'number')
    return <span className="text-indigo-400 font-mono font-bold">{value}</span>;
  if (typeof value === 'string')
    return <span className="text-slate-300">{value}</span>;
  if (Array.isArray(value))
    return (
      <ul className="mt-1.5 space-y-1.5">
        {value.map((item, i) => (
          <li key={i} className="flex items-start gap-2 ml-3">
            <span className="text-indigo-500 mt-0.5 flex-shrink-0">·</span>
            <ResultValue value={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  if (typeof value === 'object')
    return (
      <div className="space-y-2 mt-1 ml-3">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <span className="text-xs font-medium text-slate-500 capitalize">{k.replace(/_/g, ' ')}: </span>
            <ResultValue value={v} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  return <span className="text-slate-400">{String(value)}</span>;
}

// ─── Collapsible agent result card ───────────────────────────────────────────
function AgentResultCard({ agentId, agentResult, agents }: { agentId: string; agentResult: any; agents: any[] }) {
  const [open, setOpen] = useState(false);
  const agent = agents.find((a) => a.id === agentId);
  const icon = agent?.icon || agent?.emoji || '🤖';
  const name = agent?.name || agentId.replace(/-/g, ' ');
  const result = agentResult?.result || agentResult;

  return (
    <div className="rounded-xl border border-white/6 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-slate-200">{name}</span>
          {result?.score && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-bold">
              {result.score}/100
            </span>
          )}
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 text-slate-500" />
          : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-white/5 space-y-3 max-h-96 overflow-y-auto">
          {agentResult?.error ? (
            <p className="text-sm text-rose-400">{agentResult.error}</p>
          ) : (
            Object.entries(result || {}).map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {k.replace(/_/g, ' ')}
                </p>
                <div className="text-sm"><ResultValue value={v} /></div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);

  useEffect(() => {
    agentsApi.list()
      .then((res) => setAgents(res.data.agents || []))
      .catch(() => toast.error('Failed to load agents'))
      .finally(() => setAgentsLoading(false));

    videosApi.list({ page_size: 50 })
      .then((res) => setVideos(res.data.videos || []))
      .catch(() => {});
  }, []);

  const handleRun = async () => {
    if (!selectedAgent) { toast.error('Select an agent first'); return; }
    setLoading(true);
    setResult(null);
    try {
      // POST /agents/{agentId}/run  body: { video_id? }
      const res = await agentsApi.run(selectedAgent, selectedVideo || undefined);
      setResult({ type: 'single', data: res.data });
      toast.success('Agent analysis complete! 🎯');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Agent run failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAll = async () => {
    setLoading(true);
    setResult(null);
    try {
      // POST /agents/run-all  body: { video_id? }
      const res = await agentsApi.runAll(selectedVideo || undefined);
      setResult({ type: 'multi', data: res.data });
      toast.success('All 6 agents complete! 🚀');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Multi-agent run failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">AI Agents</h1>
        <p className="text-slate-500 text-sm mt-1">
          6 specialized AI agents for deep content analysis — run individually or all at once
        </p>
      </div>

      {/* Agent grid */}
      {agentsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white/3 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {agents.map((agent) => {
            const isSelected = selectedAgent === agent.id;
            // Backend uses 'icon' field (emoji string like "🎣")
            // Fallback to 'emoji' for compatibility
            const icon = agent.icon || agent.emoji || '🤖';
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
                className={cn(
                  'text-left p-4 rounded-2xl border transition-all hover:-translate-y-0.5',
                  isSelected
                    ? 'border-indigo-500/40 bg-indigo-500/10'
                    : 'glass-card hover:border-white/10'
                )}
              >
                <span className="text-2xl mb-2 block">{icon}</span>
                <p className="text-sm font-semibold text-slate-200">{agent.name}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {agent.description}
                </p>
                {isSelected && (
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Run Configuration</h3>

        {/* Video selector */}
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Video (optional — leave blank for generic demo)</label>
          <select
            value={selectedVideo}
            onChange={(e) => { setSelectedVideo(e.target.value); setResult(null); }}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40 transition-colors"
          >
            <option value="">No specific video (use demo context)</option>
            {videos.map((v) => (
              <option key={v.id} value={v.id}>
                {(v.title || 'Untitled').slice(0, 60)} ({v.platform})
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={loading || !selectedAgent}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-50 transition-all"
          >
            {loading && result?.type !== 'multi'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Play className="w-4 h-4" />}
            Run Selected Agent
          </button>
          <button
            onClick={handleRunAll}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50 transition-all"
          >
            {loading && result?.type === 'multi'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Cpu className="w-4 h-4" />}
            Run All 6 Agents
          </button>
        </div>

        {!selectedAgent && (
          <p className="text-xs text-slate-600">
            👆 Click an agent card above to select it, then hit Run
          </p>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-card rounded-2xl p-12 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="relative w-16 h-16 mx-auto">
              <Loader2 className="w-16 h-16 text-indigo-500/20 animate-spin absolute inset-0" />
              <Zap className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto" />
            </div>
            <p className="text-slate-400 text-sm">
              {result?.type === 'multi' ? 'Running all 6 agents...' : 'Agent analyzing your video...'}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
          {/* Multi-agent results */}
          {result.type === 'multi' && result.data?.results ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300">
                  All Agents Complete — {result.data.agents_run} analyses
                </h3>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  ✓ Done
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(result.data.results).map(([agentId, agentResult]: [string, any]) => (
                  <AgentResultCard
                    key={agentId}
                    agentId={agentId}
                    agentResult={agentResult}
                    agents={agents}
                  />
                ))}
              </div>
            </>
          ) : (
            /* Single agent result */
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300">
                  {agents.find((a) => a.id === selectedAgent)?.name || 'Agent'} Results
                </h3>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  ✓ Complete
                </span>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Object.entries(result.data?.result || result.data || {}).map(([k, v]) => (
                  k === 'agent' || k === 'status' ? null : (
                    <div key={k} className="border-b border-white/5 pb-4 last:border-0">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        {k.replace(/_/g, ' ')}
                      </p>
                      <div className="text-sm"><ResultValue value={v} /></div>
                    </div>
                  )
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
