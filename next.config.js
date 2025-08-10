/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  output: 'standalone',
  
  // Skip type checking during deployment
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Skip ESLint during deployment
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Environment variables for build phase
  env: {
    NEXT_PHASE: process.env.NEXT_PHASE,
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // During build, stub out database connections
    if (!dev && isServer) {
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      })
    }
    
    return config
  },
}

module.exports = nextConfig
