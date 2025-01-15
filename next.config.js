/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable server components
  experimental: {
    serverActions: false,
  },
  trailingSlash: true,
  distDir: '.next'
};

module.exports = nextConfig;