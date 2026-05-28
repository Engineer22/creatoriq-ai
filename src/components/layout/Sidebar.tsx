'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Video, BarChart3, MessageSquare,
  GitCompare, Cpu, Settings, Zap, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/analyze', icon: Video, label: 'Analyze Video' },
  { href: '/dashboard/history', icon: BarChart3, label: 'Video Library' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'AI Chat' },
  { href: '/dashboard/compare', icon: GitCompare, label: 'Compare' },
  { href: '/dashboard/agents', icon: Cpu, label: 'AI Agents' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col border-r border-white/5 bg-[#080c14] z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-display font-bold text-base text-white">CreatorIQ</span>
          <span className="ml-1 text-[10px] font-medium text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-full">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/4'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')} />
              <span>{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Credits indicator */}
      {user && (
        <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-white/3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Credits</span>
            <span className="text-xs font-medium text-slate-300">
              {user.credits_remaining}/{user.credits_limit}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (user.credits_remaining / user.credits_limit) * 100)}%`,
                background: user.credits_remaining > 20
                  ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(90deg, #f59e0b, #f43f5e)',
              }}
            />
          </div>
          {user.credits_remaining <= 10 && (
            <p className="text-[10px] text-amber-400 mt-1.5">Running low on credits</p>
          )}
        </div>
      )}

      {/* User + Settings */}
      <div className="border-t border-white/5 px-3 py-3 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/4 transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {(user.full_name || user.username)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user.full_name || user.username}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
