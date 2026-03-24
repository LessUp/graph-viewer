/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isGitHubPages ? 'true' : 'false',
  },
  output: isGitHubPages ? 'export' : 'standalone',
  ...(isGitHubPages && {
    basePath: '/graph-viewer',
    assetPrefix: '/graph-viewer/',
    images: { unoptimized: true },
  }),
};
module.exports = nextConfig;
