/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Build as standalone server, not static export
  experimental: {
    isrMemoryCacheSize: 0,
  },
};

module.exports = nextConfig;
