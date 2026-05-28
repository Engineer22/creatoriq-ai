'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Loader2, Zap, Youtube, Music2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { videosApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#ff0000', examples: ['youtube.com/watch?v=...', 'youtu.be/...', 'youtube.com/shorts/...'] },
  { id: 'tiktok', label: 'TikTok', icon: Music2, color: '#00f2ea', examples: ['tiktok.com/@user/video/...'] },
  { id: 'instagram', label: 'Instagram', icon: () => <span className="text-sm">◎</span>, color: '#e1306c', examples: ['instagram.com/reel/...'] },
];

export function VideoIngestForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const detectedPlatform = url.includes('youtube') || url.includes('youtu.be')
    ? 'youtube' : url.includes('tiktok')
    ? 'tiktok' : url.includes('instagram')
    ? 'instagram' : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await videosApi.ingest(url.trim());
      toast.success('Video ingested! AI analysis starting...');
      router.push(`/dashboard/video/${res.data.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to process video URL';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <Zap className="w-7 h-7 text-indigo-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Analyze a Video</h1>
        <p className="text-slate-400">Paste a YouTube Short, TikTok, or Instagram Reel URL to get deep AI analysis</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            detectedPlatform === 'youtube' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
            detectedPlatform === 'tiktok' ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/20' :
            detectedPlatform === 'instagram' ? 'bg-pink-500/15 text-pink-400 border border-pink-500/20' :
            'bg-white/5 text-slate-500 border border-white/5'
          )}>
            <Link2 className="w-3 h-3" />
            {detectedPlatform ? detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1) + ' detected' : 'Paste a URL below'}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Link2 className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/shorts/... or tiktok.com/..."
            className={cn(
              'w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border text-sm text-slate-200',
              'placeholder:text-slate-600 focus:outline-none transition-all duration-200',
              detectedPlatform
                ? 'border-indigo-500/30 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10'
                : 'border-white/8 focus:border-white/15 focus:ring-2 focus:ring-white/5'
            )}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className={cn(
            'w-full mt-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200',
            'flex items-center justify-center gap-2',
            loading || !url.trim()
              ? 'bg-white/5 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing video...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Analyze with AI
            </>
          )}
        </button>
      </form>

      {/* Platform examples */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {PLATFORMS.map(({ id, label, color, examples }) => (
          <div key={id} className="glass-card rounded-xl p-3">
            <div className="text-xs font-semibold mb-1.5" style={{ color }}>{label}</div>
            {examples.map((ex) => (
              <p key={ex} className="text-[10px] text-slate-600 font-mono leading-relaxed">{ex}</p>
            ))}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-6 flex items-start gap-2 text-xs text-slate-500">
        <Zap className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
        <p>AI analysis takes 30–60 seconds. We extract transcripts, analyze hooks, retention, emotion, virality, and generate a full creator report.</p>
      </div>
    </div>
  );
}
