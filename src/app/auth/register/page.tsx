'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Zap, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', full_name: '' });
  const [showPw, setShowPw] = useState(false);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('Account created! Welcome to CreatorIQ AI.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(
  typeof err.response?.data?.detail === 'string'
    ? err.response.data.detail
    : JSON.stringify(err.response?.data?.detail || 'Registration failed')
);;
    }
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  })();

  const FEATURES = [
    'AI analysis of YouTube Shorts, TikTok & Reels',
    'Hook, retention & virality scoring',
    'RAG-powered chat with your video library',
    'Multi-agent deep analysis',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a12] px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left - Features */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">CreatorIQ <span className="text-indigo-400">AI</span></span>
          </div>

          <h2 className="font-display text-3xl font-bold text-white mb-4 leading-tight">
            Understand <span className="gradient-text">WHY</span> content goes viral
          </h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            CreatorIQ AI uses multi-agent AI to analyze every dimension of your short-form videos — so you can replicate what works.
          </p>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 p-4 rounded-2xl bg-white/3 border border-white/6">
            <p className="text-xs text-slate-500 mb-2">Free plan includes</p>
            <p className="text-2xl font-bold text-white">100 credits</p>
            <p className="text-xs text-slate-500 mt-1">~100 video analyses. No credit card required.</p>
          </div>
        </div>

        {/* Right - Form */}
        <div>
          <div className="text-center mb-6 lg:hidden">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">CreatorIQ <span className="text-indigo-400">AI</span></span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-slate-500 text-sm mb-6">Free forever. No credit card required.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  required
                  placeholder="yourhandle"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/8 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= passwordStrength
                            ? passwordStrength <= 1 ? '#f43f5e' : passwordStrength <= 2 ? '#f59e0b' : passwordStrength <= 3 ? '#06b6d4' : '#10b981'
                            : 'rgba(255,255,255,0.06)'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-2',
                  isLoading
                    ? 'bg-indigo-600/50 text-white/50 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5'
                )}
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Free Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
