/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Fix for 404 errors on build files
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Optimize fonts
  optimizeFonts: true,
}

module.exports = nextConfig
