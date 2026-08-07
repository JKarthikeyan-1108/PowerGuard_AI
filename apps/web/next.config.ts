import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Proxy API calls to Express backend in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:4000/socket.io/:path*',
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

  // Standalone output for Docker
  output: 'standalone',

  // Disable server-side rendering for leaflet
  serverExternalPackages: ['leaflet'],
};

export default nextConfig;
