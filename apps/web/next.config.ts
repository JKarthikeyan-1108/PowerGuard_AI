import type { NextConfig } from 'next';

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : undefined);

const nextConfig: NextConfig = {
  // Proxy API calls to Express backend in development/container if configured
  async rewrites() {
    if (!backendUrl) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${backendUrl}/socket.io/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Standalone output for Docker container deployments, automatically disabled on Vercel
  output: process.env.VERCEL ? undefined : 'standalone',

  // Disable server-side rendering for leaflet
  serverExternalPackages: ['leaflet'],
};

export default nextConfig;
