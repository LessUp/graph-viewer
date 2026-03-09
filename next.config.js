/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  output: isGitHubPages ? 'export' : 'standalone',
  ...(isGitHubPages && {
    basePath: '/graph-viewer',
    assetPrefix: '/graph-viewer/',
    images: { unoptimized: true },
  }),
};
module.exports = nextConfig;
