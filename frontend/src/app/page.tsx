'use client';

import Link from 'next/link';
import { Zap, TrendingUp, BarChart3, MessageSquare, GitCompare, Cpu, ArrowRight, CheckCircle2, Star } from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, title: 'Deep AI Analysis', desc: 'Hook, retention, virality, emotion, storytelling — scored and explained by Gemini AI across 7 dimensions.', color: '#6366f1' },
  { icon: MessageSquare, title: 'RAG-Powered Chat', desc: 'Ask "why did this video perform well?" and get answers grounded in your actual video library.', color: '#8b5cf6' },
  { icon: GitCompare, title: 'Side-by-Side Compare', desc: 'Compare up to 5 videos simultaneously with radar charts and AI-generated insights.', color: '#06b6d4' },
  { icon: Cpu, title: 'Specialized AI Agents', desc: 'Hook Agent, Retention Agent, Emotion Agent, Trend Agent — each with deep domain expertise.', color: '#10b981' },
  { icon: TrendingUp, title: 'Script Optimizer', desc: 'AI rewrites your entire script optimized for engagement, retention, and platform-specific formats.', color: '#f59e0b' },
  { icon: Zap, title: 'Action Plans', desc: '30-day creator action plans with specific tasks, expected impact, and timeline.', color: '#f43f5e' },
];

const METRICS = [
  { value: '7', label: 'Analysis Dimensions' },
  { value: '3', label: 'Platforms Supported' },
  { value: '6', label: 'Specialized Agents' },
  { value: '<60s', label: 'Analysis Time' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060a12] text-white overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/2 left-0 w-[600px] h-[600px] bg-violet-600/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <span className="font-display text-lg font-bold">CreatorIQ <span className="text-indigo-400">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25"
            >
              Get Started Free
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium mb-6">
            <Zap className="w-3 h-3" />
            Powered by Gemini AI + RAG + Multi-Agent System
          </div>

          <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Understand{' '}
            <span className="relative">
              <span className="gradient-text">WHY</span>
            </span>{' '}
            content<br />goes viral
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            CreatorIQ AI analyzes YouTube Shorts, TikTok videos, and Instagram Reels across 7 AI-scored dimensions — then tells you exactly how to improve engagement, retention, and virality.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:-translate-y-0.5 shadow-xl shadow-indigo-500/30 text-sm"
            >
              Start Analyzing Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-card text-slate-300 hover:text-white font-medium transition-all hover:-translate-y-0.5 text-sm"
            >
              Sign In
            </Link>
          </div>

          <p className="text-xs text-slate-600 mt-4">Free plan · 100 credits · No credit card required</p>
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {METRICS.map(({ value, label }) => (
              <div key={label} className="glass-card rounded-2xl p-5 text-center">
                <p className="font-display text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Everything you need to grow</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">A complete AI-powered creator toolkit in one platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card rounded-2xl p-6 hover:border-white/10 transition-all hover:-translate-y-0.5 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
          <div className="glass-card rounded-3xl p-10 border border-indigo-500/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/30">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">Ready to grow as a creator?</h2>
            <p className="text-slate-400 text-sm mb-6">Join creators who use AI to understand and replicate viral content patterns.</p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:-translate-y-0.5 shadow-xl shadow-indigo-500/30 text-sm"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-xs text-slate-600">
            © 2024 CreatorIQ AI · Built with Gemini, FastAPI, Next.js · For creators who want to grow
          </p>
        </footer>
      </div>
    </div>
  );
}
