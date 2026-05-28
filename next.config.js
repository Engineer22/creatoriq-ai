/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'img.youtube.com',
      'i.ytimg.com',
      'p16-sign-va.tiktokcdn.com',
      'p19-sign-va.tiktokcdn.com',
      'cdninstagram.com',
      'scontent.cdninstagram.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: '**.tiktokcdn.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

module.exports = nextConfig;
