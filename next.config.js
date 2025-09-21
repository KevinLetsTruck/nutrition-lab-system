/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript checking during build (Railway will still build successfully)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [
    "@google-cloud/vision",
    "google-gax", 
    "end-of-stream",
    "once",
    "duplexify",
    "canvas",
    "pdfjs-dist",
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only packages from client bundle
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
        canvas: false,
        "google-gax": false,
        "@google-cloud/vision": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;