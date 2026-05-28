'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Zustand persist rehydrates asynchronously on mount.
    // We must wait one tick before trusting isAuthenticated.
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      // fetchMe to validate token, but don't block rendering on it
      fetchMe().catch(() => {
        // If fetchMe fails (expired token etc.), log out and redirect
        router.push('/auth/login');
      });
      setAuthChecked(true);
    }
  }, [hydrated, isAuthenticated, router, fetchMe]);

  // Show a loading spinner while rehydrating — NOT null, to avoid black screen
  if (!hydrated || !authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#060a12]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-sm text-white/40">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#060a12] overflow-hidden">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/3 rounded-full blur-3xl" />
      </div>

      <Sidebar />

      <main className="ml-64 flex-1 overflow-y-auto relative z-10">
        <div className="min-h-full p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
