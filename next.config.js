/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    isrMemoryCacheSize: 0, // Disable ISR cache during builds
  },
};

module.exports = nextConfig;
