/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Minimal config to avoid AMP issues
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Skip static optimization for problematic pages
  generateBuildId: async () => {
    return 'fntp-' + Date.now();
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
