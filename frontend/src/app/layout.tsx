import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'CreatorIQ AI — Creator Intelligence Platform',
  description: 'AI-powered analysis for YouTube Shorts, TikTok, and Instagram Reels. Understand WHY content goes viral.',
  keywords: ['creator analytics', 'AI video analysis', 'YouTube Shorts', 'TikTok analytics', 'content strategy'],
  openGraph: {
    title: 'CreatorIQ AI',
    description: 'AI-powered creator intelligence platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 9%)',
              color: 'hsl(210 40% 96%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: 'white' },
            },
          }}
        />
      </body>
    </html>
  );
}
