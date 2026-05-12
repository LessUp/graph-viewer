import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  Shield,
  Globe,
  Download,
  Share2,
  Layers,
  Code,
  Sparkles,
  ArrowRight,
  Check,
  Github,
  ExternalLink,
  Server,
  AlertTriangle,
  Info,
  Lock,
  X,
} from 'lucide-react';
import {
  ENGINE_CONFIGS,
  LANDING_ENGINE_CATEGORIES,
  LOCAL_RENDER_ENGINES,
} from '@/lib/diagramConfig';
import { CodePreview } from '@/components/landing/CodePreview';
import { LanguageRedirectHandler } from '@/components/landing/LanguageRedirectHandler';

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

// Features list
const FEATURES = [
  {
    icon: Zap,
    title: '16+ Diagram Engines',
    description:
      'Support for Mermaid, PlantUML, Graphviz, D2, Vega and other mainstream diagram syntaxes to meet various visualization needs.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Local WASM rendering engines (Mermaid, Graphviz) run entirely in the browser without uploading data to servers.',
  },
  {
    icon: Globe,
    title: 'Hybrid Rendering',
    description:
      'Local rendering for fast response, remote Kroki service for more formats (PNG/PDF) and engines.',
  },
  {
    icon: Download,
    title: 'Multi-format Export',
    description: 'Support for SVG, PNG (2x/4x HD), PDF, HTML, Markdown and other export formats.',
  },
  {
    icon: Share2,
    title: 'Instant Sharing',
    description:
      'Generate short links using LZ-string compression algorithm for easy sharing and embedding in documents.',
  },
  {
    icon: Layers,
    title: 'Multi-diagram Workspace',
    description:
      'Local persistent storage with version history, diagram management and workspace import/export.',
  },
];

// Deployment options
const DEPLOYMENT_OPTIONS = [
  {
    title: 'GitHub Pages (Demo)',
    subtitle: 'Current Version',
    badge: 'Free Trial',
    description: 'Experience core features at zero cost, no deployment required',
    features: [
      { text: 'Mermaid / Graphviz / Flowchart.js', available: true, icon: Code },
      { text: 'Local rendering, privacy secure', available: true, icon: Shield },
      { text: 'SVG format only', available: false, icon: Image },
      { text: 'No remote engine support', available: false, icon: Server },
    ],
    icon: Globe,
    cta: 'Try Now',
    href: '/editor/',
    primary: false,
    note: 'Ideal for quick testing and simple diagrams',
  },
  {
    title: 'Docker (Full Version)',
    subtitle: 'Recommended',
    badge: 'Full Features',
    description: 'One-click deployment for complete 16+ engine support and advanced features',
    features: [
      { text: 'All 16+ diagram engines', available: true, icon: Layers },
      { text: 'SVG / PNG / PDF all formats', available: true, icon: Download },
      { text: 'Optional AI assistance', available: true, icon: Sparkles },
      { text: 'Complete data persistence', available: true, icon: Lock },
    ],
    icon: Server,
    cta: 'View Deployment Guide',
    href: 'https://github.com/LessUp/graph-viewer#deployment',
    primary: true,
    note: 'Ideal for team collaboration and production',
  },
];

// Demo version limitations
const STATIC_EXPORT_LIMITS = [
  {
    category: 'Supported Engines',
    demo: '3 (Mermaid, Graphviz, Flowchart.js)',
    full: '16+ (including PlantUML, D2, Vega, etc.)',
  },
  {
    category: 'Export Formats',
    demo: 'SVG only',
    full: 'SVG, PNG (2x/4x), PDF, HTML, Markdown',
  },
  {
    category: 'AI Features',
    demo: 'Not supported',
    full: 'Optional, supports code analysis and generation',
  },
  {
    category: 'Deployment',
    demo: 'GitHub Pages static hosting',
    full: 'Docker, Vercel, Netlify, self-hosted servers',
  },
];

function LandingPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Suspense fallback={null}>
        <LanguageRedirectHandler />
      </Suspense>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">GraphViewer</span>
            {isStaticExport && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                Demo
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              中文
            </Link>
            <Link
              href="https://github.com/LessUp/graph-viewer"
              target="_blank"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
            <Link
              href="/editor/"
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800"
            >
              <Zap className="h-4 w-4" />
              Try Online
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100/50 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-[400px] w-[600px] translate-x-1/3 rounded-full bg-indigo-100/50 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          {/* Demo Version Badge */}
          {isStaticExport && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm">
              <Globe className="h-4 w-4" />
              <span>Currently running GitHub Pages Demo</span>
              <span className="mx-1 text-amber-400">|</span>
              <Link href="#deployment" className="underline hover:text-amber-800">
                Learn limitations
              </Link>
            </div>
          )}

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700">
            <Sparkles className="h-4 w-4" />
            <span>Open Source & Free · Ready to Use</span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Modern Diagram Visualization Tool
            <span className="block bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              16+ Engines in One Place
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
            Supports Mermaid, PlantUML, Graphviz, D2 and other mainstream diagram syntaxes.
            <span className="font-medium text-slate-900">
              Local rendering protects privacy
            </span>,{' '}
            <span className="font-medium text-slate-900">
              remote rendering supports more formats
            </span>
            .
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/editor/"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-xl hover:shadow-sky-500/30"
            >
              <Zap className="h-5 w-5" />
              Try Online
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://github.com/LessUp/graph-viewer"
              target="_blank"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Github className="h-5 w-5" />
              GitHub Repository
            </Link>
          </div>

          {/* GitHub Stars Badge */}
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-500">
            <Image
              src="https://img.shields.io/github/stars/LessUp/graph-viewer?style=social"
              alt="GitHub Stars"
              width={100}
              height={24}
              className="h-6 w-auto"
              unoptimized
            />
            <span>·</span>
            <span>MIT License</span>
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-slate-900">Clean and Intuitive Editing</h2>
            <p className="text-slate-600">
              Real-time preview, syntax highlighting, auto-completion for smoother diagram creation
            </p>
          </div>

          <CodePreview />
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              Powerful and Flexible Features
            </h2>
            <p className="text-lg text-slate-600">
              Meeting diagram needs of individual developers and enterprise teams
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-sky-200 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-600 transition-colors group-hover:from-sky-100 group-hover:to-indigo-100">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engines Showcase */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              Supporting 16+ Diagram Engines
            </h2>
            <p className="text-lg text-slate-600">
              From simple flowcharts to complex data visualization, one tool does it all
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {LANDING_ENGINE_CATEGORIES.map((category) => (
              <div key={category.name} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{category.name}</h3>
                <p className="mb-4 text-sm text-slate-500">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.engines.map((engineId) => {
                    const config = ENGINE_CONFIGS[engineId];
                    if (!config) return null;
                    const isLocal = LOCAL_RENDER_ENGINES.includes(engineId);
                    return (
                      <div
                        key={engineId}
                        className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors hover:border-sky-200 hover:bg-sky-50"
                      >
                        <Code className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-700">{config.label}</span>
                        {isLocal && (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                            Local
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-amber-50 px-6 py-4 text-center text-sm text-amber-800">
            <span className="font-medium">💡 Tip:</span> Engines marked "Local" work fully in the
            GitHub Pages demo without backend services. Full Docker deployment supports all 16+
            engines and PNG/PDF export.
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <section id="deployment" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              Choose Your Deployment Method
            </h2>
            <p className="text-lg text-slate-600">
              From free demo to full production, flexible for all needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {DEPLOYMENT_OPTIONS.map((option) => (
              <div
                key={option.title}
                className={`relative rounded-2xl border-2 p-8 ${
                  option.primary
                    ? 'border-sky-500 bg-gradient-to-br from-sky-50/50 to-indigo-50/50'
                    : isStaticExport
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-slate-200 bg-white'
                }`}
              >
                {/* Badge */}
                {option.primary ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white">
                      {option.badge}
                    </span>
                  </div>
                ) : (
                  isStaticExport && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                        {option.badge}
                      </span>
                    </div>
                  )
                )}

                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                  <option.icon
                    className={`h-7 w-7 ${option.primary ? 'text-sky-600' : isStaticExport ? 'text-amber-600' : 'text-slate-600'}`}
                  />
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{option.title}</h3>
                  {isStaticExport && !option.primary && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Current
                    </span>
                  )}
                </div>
                <p className="mb-6 text-sm text-slate-500">{option.note}</p>
                <p className="mb-6 text-slate-600">{option.description}</p>

                <ul className="mb-8 space-y-3">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      {feature.available ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
                          <X className="h-3 w-3 text-slate-400" />
                        </div>
                      )}
                      <span className={feature.available ? 'text-slate-700' : 'text-slate-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={option.href}
                  target={option.href.startsWith('http') ? '_blank' : undefined}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all ${
                    option.primary
                      ? 'bg-sky-600 text-white hover:bg-sky-700'
                      : isStaticExport
                        ? 'border-2 border-amber-300 bg-amber-500 text-white hover:bg-amber-600'
                        : 'border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {option.cta}
                  {option.href.startsWith('http') && <ExternalLink className="h-4 w-4" />}
                </Link>
              </div>
            ))}
          </div>

          {/* Static Export Limitations Table */}
          {isStaticExport && (
            <div className="mt-12 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
              <div className="border-b border-amber-200 bg-amber-100/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-900">
                    Demo (GitHub Pages) Feature Limitations
                  </h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-200/60 bg-amber-50/30">
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Feature</th>
                      <th className="px-6 py-3 text-left font-semibold text-amber-700">
                        <span className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          Demo (Current)
                        </span>
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-sky-700">
                        <span className="flex items-center gap-1">
                          <Server className="h-4 w-4" />
                          Docker Full Version
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {STATIC_EXPORT_LIMITS.map((row, idx) => (
                      <tr key={idx} className="border-b border-amber-100 last:border-0">
                        <td className="px-6 py-3 font-medium text-slate-700">{row.category}</td>
                        <td className="px-6 py-3 text-amber-700">{row.demo}</td>
                        <td className="px-6 py-3 text-sky-700">{row.full}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-amber-200 bg-amber-100/30 px-6 py-3">
                <p className="text-xs text-amber-800">
                  <span className="font-medium">💡 Tip:</span> The demo uses local WASM rendering
                  engines, processing data entirely in the browser for privacy protection. For full
                  features, consider{' '}
                  <Link
                    href="https://github.com/LessUp/graph-viewer#deployment"
                    target="_blank"
                    className="mx-1 font-medium underline hover:text-amber-900"
                  >
                    deploying the Docker full version
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Get Started?</h2>
          <p className="mb-8 text-lg text-slate-300">
            {isStaticExport
              ? 'Currently in demo mode with 3 local rendering engines. Deploy the full version to unlock all 16+ engines and advanced features.'
              : 'No registration required, try it in your browser now. Or deploy your own instance for full features.'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/editor/"
              className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:bg-slate-100"
            >
              <Zap className="h-5 w-5" />
              {isStaticExport ? 'Try in Demo' : 'Try Now'}
            </Link>
            <Link
              href="https://github.com/LessUp/graph-viewer#deployment"
              target="_blank"
              className={`flex items-center gap-2 rounded-xl border px-8 py-4 text-base font-semibold transition-all ${
                isStaticExport
                  ? 'border-sky-500 bg-sky-600 text-white hover:bg-sky-500'
                  : 'border-slate-600 bg-transparent text-white hover:bg-white/10'
              }`}
            >
              <Server className="h-5 w-5" />
              {isStaticExport ? 'Deploy Full Version' : 'Star on GitHub'}
            </Link>
          </div>

          {isStaticExport && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <span>Demo has limited features,</span>
              <Link href="#deployment" className="font-medium underline hover:text-amber-200">
                view detailed comparison
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-slate-900">GraphViewer</span>
              </div>
              <p className="text-sm text-slate-500">
                Modern diagram visualization tool, open source and free, ready to use.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-slate-900">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/editor/" className="hover:text-sky-600">
                    Try Online
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-sky-600">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#engines" className="hover:text-sky-600">
                    Supported Engines
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-slate-900">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link
                    href="https://github.com/LessUp/graph-viewer"
                    target="_blank"
                    className="hover:text-sky-600"
                  >
                    GitHub Repository
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/LessUp/graph-viewer/blob/master/README.md"
                    target="_blank"
                    className="hover:text-sky-600"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/LessUp/graph-viewer/issues"
                    target="_blank"
                    className="hover:text-sky-600"
                  >
                    Issue Tracker
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-slate-900">Technology</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <span className="text-slate-400">Next.js 15</span>
                </li>
                <li>
                  <span className="text-slate-400">React 19</span>
                </li>
                <li>
                  <span className="text-slate-400">WASM Local Rendering</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 sm:flex-row">
            <p>© 2024 GraphViewer. Open source under MIT License.</p>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/LessUp/graph-viewer"
                target="_blank"
                className="hover:text-slate-700"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return <LandingPageContent />;
}
