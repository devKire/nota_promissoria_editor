/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    cssChunking: true,
  },
};

module.exports = nextConfig;
