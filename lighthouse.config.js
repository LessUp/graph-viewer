module.exports = {
  ci: {
    collect: {
      // Static site directory
      staticDistDir: './out',
      // Number of runs to average
      numberOfRuns: 3,
      // URL to test
      url: ['http://localhost/'],
      // Chrome flags for consistent results
      chromeFlags: '--no-sandbox --headless --disable-gpu --disable-dev-shm-usage',
      // Settings for local server
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        skipAudits: ['uses-http2', 'uses-text-compression'],
        throttling: {
          cpuSlowdownMultiplier: 2,
          downloadThroughputKbps: 15000,
          uploadThroughputKbps: 7500,
          rttMs: 40,
        },
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
        },
        emulatedUserAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
    assert: {
      // Performance assertions
      assertions: {
        'categories:performance': ['error', { minScore: 0.6 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.5 }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],

        // Other important metrics
        interactive: ['warn', { maxNumericValue: 3500 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],

        // Resource budgets
        'resource-summary:document:size': ['warn', { maxNumericValue: 50000 }], // 50KB
        'resource-summary:script:size': ['warn', { maxNumericValue: 1000000 }], // 1MB
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }], // 1MB
        'resource-summary:total:size': ['warn', { maxNumericValue: 5000000 }], // 5MB
      },
    },
    upload: {
      // Upload to temporary public storage for PR previews
      target: 'temporary-public-storage',
      // Link build to GitHub
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      // Server token for persistent storage (optional)
      serverBaseUrl: process.env.LHCI_SERVER_BASE_URL || undefined,
      token: process.env.LHCI_TOKEN || undefined,
    },
    server: {
      // Storage settings for self-hosted server
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlConnectionUrl: './lhci.db',
      },
    },
    wizard: {
      // Settings for lhci wizard
      serverBaseUrl: process.env.LHCI_SERVER_BASE_URL || 'http://localhost:9001',
    },
  },
};
