'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Loader2, Zap, Youtube, Tv2, Instagram } from 'lucide-react';
import { videosApi } from '@/lib/api';
import toast from 'react-hot-toast';

const PLATFORMS = [
  { name: 'YouTube', icon: Youtube, color: '#ff0000', placeholder: 'https://youtube.com/watch?v=...' },
  { name: 'TikTok', icon: Tv2, color: '#000000', placeholder: 'https://tiktok.com/@user/video/...' },
  { name: 'Instagram', icon: Instagram, color: '#e1306c', placeholder: 'https://instagram.com/reel/...' },
];

const DEMO_URLS = [
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/watch?v=jNQXAC9IVRw',
  'https://tiktok.com/@creator/video/7291234567890',
  'https://instagram.com/reel/ABC123xyz/',
];

export default function AnalyzePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');

  const STEPS = [
    'Fetching video metadata...',
    'Analyzing hook strength...',
    'Measuring viral potential...',
    'Scoring emotional triggers...',
    'Generating recommendations...',
    'Building your creator report...',
  ];

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error('Please enter a video URL');
      return;
    }

    setLoading(true);
    let stepIdx = 0;
    setStep(STEPS[0]);

    // Animate steps while the real API call runs
    const stepInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1);
      setStep(STEPS[stepIdx]);
    }, 400);

    try {
      const res = await videosApi.analyze(trimmed);
      clearInterval(stepInterval);

      const video = res.data?.video;
      if (!video?.id) throw new Error('No video ID returned');

      toast.success('Analysis complete! 🎉');
      router.push(`/dashboard/video/${video.id}`);
    } catch (err: any) {
      clearInterval(stepInterval);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Analysis failed. Please try again.';
      toast.error(msg);
      setLoading(false);
      setStep('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleAnalyze();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-indigo-400">Instant AI Analysis</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white">Analyze a Video</h1>
        <p className="text-slate-500 text-sm">
          Paste any YouTube, TikTok, or Instagram Reel URL for instant AI analysis
        </p>
      </div>

      {/* URL Input */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your video URL here..."
            disabled={loading}
            className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all disabled:opacity-50"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {step}
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Analyze Now
            </>
          )}
        </button>

        {/* Supported platforms */}
        <div className="flex items-center justify-center gap-6 pt-2">
          {PLATFORMS.map(({ name, icon: Icon, color }) => (
            <div key={name} className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Demo URLs */}
      <div className="space-y-3">
        <p className="text-xs text-slate-600 text-center uppercase tracking-wider font-medium">
          Try a demo URL
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_URLS.map((demoUrl) => (
            <button
              key={demoUrl}
              onClick={() => setUrl(demoUrl)}
              disabled={loading}
              className="text-left px-3 py-2.5 rounded-xl bg-white/3 border border-white/6 hover:border-white/12 hover:bg-white/5 transition-all text-xs text-slate-500 hover:text-slate-300 truncate disabled:opacity-40"
            >
              {demoUrl}
            </button>
          ))}
        </div>
      </div>

      {/* What you get */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          What you'll get instantly
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['🎣', 'Hook Score', 'First-3-second stopping power'],
            ['🚀', 'Viral Score', 'Predicted reach multiplier'],
            ['💧', 'Retention Score', 'Watch-time retention analysis'],
            ['🎯', 'CTA Score', 'Call-to-action effectiveness'],
            ['✍️', 'Script Rewrite', 'Optimized hook & CTA copy'],
            ['🧠', 'Emotional Triggers', 'Audience psychology breakdown'],
            ['📊', 'Action Plan', 'Prioritized improvement tasks'],
            ['👥', 'Audience Insights', 'Target audience profile'],
          ].map(([emoji, title, desc]) => (
            <div key={title} className="flex items-start gap-2.5">
              <span className="text-base">{emoji}</span>
              <div>
                <p className="text-xs font-semibold text-slate-300">{title}</p>
                <p className="text-[11px] text-slate-600 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
