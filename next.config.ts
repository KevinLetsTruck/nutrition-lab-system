import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // External packages for server-side processing
  serverExternalPackages: ['canvas', 'sharp', 'pdf-parse', 'pdf2pic'],
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Security: prevent eval in production
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimize = true;
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '') || 'localhost'
    ].filter(Boolean),
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
  // Redirects for security
  async redirects() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
        permanent: false,
      },
    ];
  },
  
  // Experimental features for performance
  experimental: {
    scrollRestoration: true,
  },
};

export default nextConfig;
