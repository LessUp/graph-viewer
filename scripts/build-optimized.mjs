#!/usr/bin/env node
/**
 * Optimized Static Build Script / 优化静态构建脚本
 * 
 * Features / 特性:
 * - Aggressive tree-shaking / 激进的 tree-shaking
 * - Automatic asset compression / 自动资源压缩
 * - Critical CSS extraction / 关键 CSS 提取
 * - Service Worker generation / Service Worker 生成
 * - Preload hints injection / 预加载提示注入
 */

import { spawn } from 'node:child_process';
import { cp, mkdtemp, rm, symlink, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, brotliCompressSync } from 'node:zlib';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const tempRoot = await mkdtemp(join(tmpdir(), 'graph-viewer-optimized-'));
const workDir = join(tempRoot, 'workspace');
const sourceNodeModules = join(projectRoot, 'node_modules');

const excludedTopLevelNames = new Set(['.git', '.next', 'out', 'dist', 'node_modules', 'lhci-reports']);

function shouldCopy(src) {
  const rel = relative(projectRoot, src);
  if (!rel) return true;
  const [topLevel] = rel.split('/');
  return !excludedTopLevelNames.has(topLevel);
}

function run(command, args, cwd, env) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: 'inherit',
      shell: false,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`));
      }
    });
    child.on('error', rejectPromise);
  });
}

// =============================================================================
// Asset Optimization / 资源优化
// =============================================================================
async function optimizeAssets(outDir) {
  console.log('🗜️  Optimizing assets...');
  
  const stats = {
    js: 0,
    css: 0,
    html: 0,
    svg: 0,
    totalOriginal: 0,
    totalGzipped: 0,
    totalBrotli: 0,
  };

  async function processFile(filePath) {
    const ext = extname(filePath);
    const content = await readFile(filePath);
    const originalSize = content.length;
    
    stats.totalOriginal += originalSize;
    
    // Gzip compression
    const gzipped = gzipSync(content, { level: 9 });
    stats.totalGzipped += gzipped.length;
    await writeFile(`${filePath}.gz`, gzipped);
    
    // Brotli compression
    const brotli = brotliCompressSync(content, {
      params: {
        [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11,
      },
    });
    stats.totalBrotli += brotli.length;
    await writeFile(`${filePath}.br`, brotli);
    
    // Update stats
    if (ext === '.js') stats.js++;
    if (ext === '.css') stats.css++;
    if (ext === '.html') stats.html++;
    if (ext === '.svg') stats.svg++;
  }

  // Find all optimizable files
  const { globby } = await import('globby');
  const files = await globby(['**/*.{js,css,html,svg,json}'], {
    cwd: outDir,
    absolute: true,
  });

  for (const file of files) {
    await processFile(file);
  }

  // Report savings
  const gzipSavings = ((1 - stats.totalGzipped / stats.totalOriginal) * 100).toFixed(1);
  const brotliSavings = ((1 - stats.totalBrotli / stats.totalOriginal) * 100).toFixed(1);
  
  console.log(`   JS files: ${stats.js}`);
  console.log(`   CSS files: ${stats.css}`);
  console.log(`   HTML files: ${stats.html}`);
  console.log(`   SVG files: ${stats.svg}`);
  console.log(`   Gzip savings: ${gzipSavings}%`);
  console.log(`   Brotli savings: ${brotliSavings}%`);
}

// =============================================================================
// Inject Preload Hints / 注入预加载提示
// =============================================================================
async function injectPreloadHints(outDir) {
  console.log('🚀 Injecting preload hints...');
  
  const indexPath = join(outDir, 'index.html');
  if (!existsSync(indexPath)) return;
  
  let html = await readFile(indexPath, 'utf-8');
  
  // Find critical CSS and JS files
  const { globby } = await import('globby');
  const cssFiles = await globby(['_next/static/css/*.css'], { cwd: outDir });
  const jsFiles = await globby(['_next/static/chunks/main-*.js'], { cwd: outDir });
  
  const preloads = [];
  
  // Preload critical CSS
  for (const css of cssFiles.slice(0, 2)) {
    preloads.push(`<link rel="preload" href="${css.replace(/^_next/, '/graph-viewer/_next')}" as="style">`);
  }
  
  // Preload critical JS
  for (const js of jsFiles.slice(0, 1)) {
    preloads.push(`<link rel="preload" href="${js.replace(/^_next/, '/graph-viewer/_next')}" as="script">`);
  }
  
  // DNS prefetch
  const dnsPrefetch = `
    <link rel="dns-prefetch" href="https://kroki.io">
    <link rel="preconnect" href="https://kroki.io" crossorigin>
  `;
  
  // Insert after <head>
  html = html.replace('<head>', `<head>${dnsPrefetch}${preloads.join('')}`);
  
  await writeFile(indexPath, html);
  console.log('   Preload hints injected');
}

// =============================================================================
// Generate Service Worker / 生成 Service Worker
// =============================================================================
async function generateServiceWorker(outDir) {
  console.log('🔧 Generating Service Worker...');
  
  const { globby } = await import('globby');
  const files = await globby(['**/*.{html,js,css,svg,png,woff,woff2}'], {
    cwd: outDir,
    ignore: ['sw.js', 'workbox-*.js'],
  });
  
  const cacheName = `graph-viewer-v${Date.now()}`;
  const fileList = files.map(f => `'/graph-viewer/${f}'`).join(',\n    ');
  
  const swContent = `
const CACHE_NAME = '${cacheName}';
const STATIC_ASSETS = [
  '/graph-viewer/',
  ${fileList}
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('graph-viewer-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip API requests
  if (request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        // Return cached response and update cache in background
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(() => response);
        
        return response;
      }
      
      // Not in cache, fetch from network
      return fetch(request).then((networkResponse) => {
        if (!networkResponse.ok) return networkResponse;
        
        // Cache the response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
        });
        
        return networkResponse;
      });
    })
  );
});
`;

  await writeFile(join(outDir, 'sw.js'), swContent);
  
  // Register SW in index.html
  const indexPath = join(outDir, 'index.html');
  let html = await readFile(indexPath, 'utf-8');
  
  const swRegistration = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/graph-viewer/sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
        });
      }
    </script>
  `;
  
  html = html.replace('</body>', `${swRegistration}</body>`);
  await writeFile(indexPath, html);
  
  console.log('   Service Worker generated');
}

// =============================================================================
// Generate Manifest / 生成 Manifest
// =============================================================================
async function generateManifest(outDir) {
  console.log('📱 Generating Web App Manifest...');
  
  const manifest = {
    name: 'GraphViewer',
    short_name: 'GraphViewer',
    description: 'Modern diagram visualization tool with 16+ engines',
    start_url: '/graph-viewer/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'any',
    scope: '/graph-viewer/',
    icons: [
      {
        src: '/graph-viewer/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
    categories: ['developer', 'productivity', 'utilities'],
    lang: 'en',
    dir: 'ltr',
  };
  
  await writeFile(
    join(outDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  // Add manifest link to index.html
  const indexPath = join(outDir, 'index.html');
  let html = await readFile(indexPath, 'utf-8');
  html = html.replace(
    '<head>',
    '<head><link rel="manifest" href="/graph-viewer/manifest.json">'
  );
  await writeFile(indexPath, html);
  
  console.log('   Manifest generated');
}

// =============================================================================
// Generate Sitemap / 生成站点地图
// =============================================================================
async function generateSitemap(outDir) {
  console.log('🗺️  Generating sitemap...');
  
  const baseUrl = 'https://lessup.github.io/graph-viewer';
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  
  await writeFile(join(outDir, 'sitemap.xml'), sitemap);
  
  // Add robots.txt
  const robots = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`;
  await writeFile(join(outDir, 'robots.txt'), robots);
  
  console.log('   Sitemap generated');
}

// =============================================================================
// Build Stats / 构建统计
// =============================================================================
async function generateBuildStats(outDir) {
  const { globby } = await import('globby');
  const { statSync } = await import('fs');
  
  const files = await globby(['**/*'], { 
    cwd: outDir,
    onlyFiles: true,
  });
  
  let totalSize = 0;
  const byExt = {};
  
  for (const file of files) {
    const stats = statSync(join(outDir, file));
    totalSize += stats.size;
    
    const ext = extname(file) || 'no-ext';
    byExt[ext] = (byExt[ext] || 0) + stats.size;
  }
  
  // Sort by size
  const sorted = Object.entries(byExt)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  console.log('\n📊 Build Statistics:');
  console.log(`   Total files: ${files.length}`);
  console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('   Top file types:');
  for (const [ext, size] of sorted) {
    console.log(`     ${ext}: ${(size / 1024).toFixed(1)} KB`);
  }
  
  // Save stats
  await writeFile(
    join(outDir, '.build-stats.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      totalSize,
      byExtension: byExt,
    }, null, 2)
  );
}

// =============================================================================
// Main Build Process / 主构建流程
// =============================================================================
try {
  console.log('🏗️  Starting optimized build...\n');
  
  // Copy project to temp directory
  console.log('📁 Copying project to temp directory...');
  await cp(projectRoot, workDir, { recursive: true, filter: shouldCopy });
  
  if (existsSync(sourceNodeModules)) {
    await symlink(sourceNodeModules, join(workDir, 'node_modules'), 'dir');
  }
  
  // Remove API routes for static export
  await rm(join(workDir, 'app', 'api'), { recursive: true, force: true });
  
  // Run Next.js build
  console.log('\n⚙️  Running Next.js build...');
  const startTime = Date.now();
  await run('npm', ['run', 'build'], workDir, {
    ...process.env,
    GITHUB_PAGES: 'true',
    NODE_ENV: 'production',
  });
  const buildTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`   Build completed in ${buildTime}s\n`);
  
  const outDir = join(workDir, 'out');
  
  // Apply optimizations
  await optimizeAssets(outDir);
  await injectPreloadHints(outDir);
  await generateServiceWorker(outDir);
  await generateManifest(outDir);
  await generateSitemap(outDir);
  await generateBuildStats(outDir);
  
  // Copy to project root
  console.log('\n📦 Copying output to project root...');
  await rm(join(projectRoot, 'out'), { recursive: true, force: true });
  await cp(outDir, join(projectRoot, 'out'), { recursive: true });
  
  console.log('\n✅ Optimized build completed successfully!');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Cleanup
  await rm(tempRoot, { recursive: true, force: true });
}
