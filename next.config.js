/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const isLighthouseCI = process.env.LHCI === 'true';
const isProduction = process.env.NODE_ENV === 'production';

// =============================================================================
// Dynamic BasePath for GitHub Pages / GitHub Pages 动态基础路径
// =============================================================================
// Automatically detect repository name from GITHUB_REPOSITORY env variable
// 从 GITHUB_REPOSITORY 环境变量自动检测仓库名称
// Format: owner/repo -> extract repo name / 格式：owner/repo -> 提取 repo 名称
let gitHubPagesRepoName = 'graph-viewer';
if (process.env.GITHUB_REPOSITORY) {
  const parts = process.env.GITHUB_REPOSITORY.split('/');
  if (parts.length === 2 && parts[1]) {
    gitHubPagesRepoName = parts[1];
  }
}
const gitHubPagesBasePath = `/${gitHubPagesRepoName}`;

// =============================================================================
// EXTREME OPTIMIZATION CONFIG / 极致优化配置
// =============================================================================

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,

  // ===========================================================================
  // Environment Variables / 环境变量
  // ===========================================================================
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isGitHubPages || isLighthouseCI ? 'true' : 'false',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // ===========================================================================
  // Output Configuration / 输出配置
  // ===========================================================================
  output: isGitHubPages || isLighthouseCI ? 'export' : 'standalone',
  distDir: isGitHubPages || isLighthouseCI ? 'out' : '.next',

  // ===========================================================================
  // Static Export Configuration / 静态导出配置
  // ===========================================================================
  // Note: exportPathMap is not compatible with App Router
  // Use generateStaticParams() in individual pages instead
  // 注意：exportPathMap 与 App Router 不兼容
  // 请在各个页面中使用 generateStaticParams() 代替

  // ===========================================================================
  // GitHub Pages Specific / GitHub Pages 专属配置
  // ===========================================================================
  ...(isGitHubPages && {
    basePath: gitHubPagesBasePath,
    assetPrefix: `${gitHubPagesBasePath}/`,
    trailingSlash: true,

    // Images must be unoptimized for static export
    images: {
      unoptimized: true,
      remotePatterns: [],
    },
  }),

  // Lighthouse CI build - static export without basePath
  ...(isLighthouseCI && {
    trailingSlash: true,
    images: {
      unoptimized: true,
      remotePatterns: [],
    },
  }),

  // ===========================================================================
  // Performance Optimizations / 性能优化
  // ===========================================================================

  // SWC minification is default in Next.js 15+

  // Experimental features for optimization
  experimental: {
    // Optimize package imports for common libraries
    optimizePackageImports: ['lucide-react', '@codemirror', 'mermaid'],

    // Turbopack for dev (when stable)
    // turbo: {},

    // Optimize CSS
    optimizeCss: isProduction,
  },

  // ===========================================================================
  // Compiler Optimizations / 编译器优化
  // ===========================================================================
  compiler: {
    // Remove console.log in production
    removeConsole: isProduction
      ? {
          exclude: ['error', 'warn'],
        }
      : false,

    // React optimizations
    reactRemoveProperties: isProduction,
  },

  // ===========================================================================
  // Webpack Optimizations / Webpack 优化
  // ===========================================================================
  webpack: (config, { dev, isServer, nextRuntime: _nextRuntime }) => {
    // Only apply optimizations for client-side production builds
    if (!dev && !isServer) {
      // Split chunks more aggressively
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // React core
            reactCore: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react-core',
              priority: 40,
              enforce: true,
            },
            // Mermaid (large library)
            mermaid: {
              test: /[\\/]node_modules[\\/]mermaid[\\/]/,
              name: 'mermaid',
              priority: 30,
              enforce: true,
            },
            // CodeMirror
            codemirror: {
              test: /[\\/]node_modules[\\/]@codemirror[\\/]/,
              name: 'codemirror',
              priority: 25,
              enforce: true,
            },
            // UI Components
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: 'ui',
              priority: 20,
              enforce: true,
            },
            // Vendor everything else
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Common code
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },

        // Aggressive module concatenation
        concatenateModules: true,

        // Minimize module IDs
        moduleIds: 'deterministic',
      };

      // Add resource hints for critical assets
      config.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        new (require('webpack').DefinePlugin)({
          'process.env.GITHUB_PAGES': JSON.stringify(isGitHubPages),
        }),
      );
    }

    // Fix for certain npm packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    return config;
  },

  // ===========================================================================
  // Headers / 响应头配置 (ISR only, not for static export)
  // ===========================================================================
  async headers() {
    if (isGitHubPages) return [];

    return [
      {
        source: '/:all*(js|css|svg|png|jpg|jpeg|gif|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // ===========================================================================
  // Redirects / 重定向
  // ===========================================================================
  async redirects() {
    return [];
  },

  // ===========================================================================
  // Rewrites / 重写规则
  // ===========================================================================
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
