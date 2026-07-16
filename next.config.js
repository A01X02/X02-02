/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.myqcloud.com' },
      { protocol: 'https', hostname: '**.volces.com' },
    ],
  },
};

module.exports = nextConfig;
