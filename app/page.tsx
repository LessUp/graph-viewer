'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { ENGINE_CONFIGS, type Engine } from '@/lib/diagramConfig';
import { SAMPLES } from '@/lib/diagramSamples';

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

// 本地渲染支持的引擎
const LOCAL_ENGINES: Engine[] = ['mermaid', 'graphviz', 'flowchart'];

// 特性列表
const FEATURES = [
  {
    icon: Zap,
    title: '16+ 图表引擎',
    description: '支持 Mermaid、PlantUML、Graphviz、D2、Vega 等主流图表语法，满足各种可视化需求。',
  },
  {
    icon: Shield,
    title: '隐私优先',
    description:
      '本地 WASM 渲染引擎（Mermaid、Graphviz）完全在浏览器中运行，无需上传数据到服务器。',
  },
  {
    icon: Globe,
    title: '混合渲染架构',
    description: '本地渲染快速响应，远程 Kroki 服务支持更多格式（PNG/PDF）和引擎。',
  },
  {
    icon: Download,
    title: '多格式导出',
    description: '支持 SVG、PNG（2x/4x 高清）、PDF、HTML、Markdown 等多种格式导出。',
  },
  {
    icon: Share2,
    title: '即时分享',
    description: '使用 LZ-string 压缩算法生成短链接，方便分享和嵌入到文档中。',
  },
  {
    icon: Layers,
    title: '多图表工作区',
    description: '本地持久化存储，支持版本历史、图表管理和工作区导入导出。',
  },
];

// 引擎分类展示
const ENGINE_DISPLAY_CATEGORIES = [
  {
    name: '常用图表',
    engines: ['mermaid', 'plantuml', 'graphviz', 'd2'] as Engine[],
    description: '最流行的图表引擎，覆盖大部分使用场景',
  },
  {
    name: '流程图系列',
    engines: ['flowchart', 'blockdiag', 'actdiag'] as Engine[],
    description: '专注于流程图和活动图',
  },
  {
    name: '数据可视化',
    engines: ['vega', 'vegalite', 'wavedrom'] as Engine[],
    description: '数据驱动的可视化方案',
  },
  {
    name: '其他专业工具',
    engines: ['nomnoml', 'ditaa', 'svgbob', 'erd'] as Engine[],
    description: '特定领域的专业图表工具',
  },
];

// 部署方式
const DEPLOYMENT_OPTIONS = [
  {
    title: 'GitHub Pages（演示版）',
    subtitle: '当前版本',
    badge: '免费体验',
    description: '零成本快速体验核心功能，无需部署即可在浏览器中使用',
    features: [
      { text: 'Mermaid / Graphviz / Flowchart.js', available: true, icon: Code },
      { text: '本地渲染，隐私安全', available: true, icon: Shield },
      { text: '仅支持 SVG 格式', available: false, icon: Image },
      { text: '无远程引擎支持', available: false, icon: Server },
    ],
    icon: Globe,
    cta: '立即体验',
    href: '/editor/',
    primary: false,
    note: '适合快速体验和简单图表绘制',
  },
  {
    title: 'Docker（完整版）',
    subtitle: '推荐',
    badge: '完整功能',
    description: '一键部署，获得完整的 16+ 引擎支持和高级功能',
    features: [
      { text: '全部 16+ 图表引擎', available: true, icon: Layers },
      { text: 'SVG / PNG / PDF 全格式导出', available: true, icon: Download },
      { text: '可选 AI 辅助功能', available: true, icon: Sparkles },
      { text: '完整的数据持久化', available: true, icon: Lock },
    ],
    icon: Server,
    cta: '查看部署指南',
    href: 'https://github.com/LessUp/graph-viewer#deployment',
    primary: true,
    note: '适合团队协作和生产环境',
  },
];

// 演示版功能限制说明
const STATIC_EXPORT_LIMITS = [
  {
    category: '支持引擎',
    demo: '3 个（Mermaid, Graphviz, Flowchart.js）',
    full: '16+ 个（包括 PlantUML, D2, Vega 等）',
  },
  {
    category: '导出格式',
    demo: '仅 SVG',
    full: 'SVG, PNG (2x/4x), PDF, HTML, Markdown',
  },
  {
    category: 'AI 功能',
    demo: '不支持',
    full: '可选配置，支持代码分析和生成',
  },
  {
    category: '部署方式',
    demo: 'GitHub Pages 静态托管',
    full: 'Docker, Vercel, Netlify, 自建服务器',
  },
];

// 代码示例展示
const CODE_EXAMPLES = [
  { name: 'Mermaid 流程图', code: SAMPLES['mermaid'], lang: 'mermaid' },
  { name: 'Graphviz DOT', code: SAMPLES['graphviz'], lang: 'dot' },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle redirect from 404.html for deep links
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      // Remove the redirect param and navigate to the target path
      const cleanPath = redirect.replace(/^\/+/, ''); // Remove leading slashes
      if (cleanPath) {
        router.replace('/' + cleanPath);
      }
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
                演示版
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
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
              在线试用
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
              <span>当前为 GitHub Pages 演示版</span>
              <span className="mx-1 text-amber-400">|</span>
              <Link href="#deployment" className="underline hover:text-amber-800">
                了解限制
              </Link>
            </div>
          )}

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700">
            <Sparkles className="h-4 w-4" />
            <span>开源免费 · 开箱即用</span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            现代图表可视化工具
            <span className="block bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              16+ 引擎一体化支持
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
            支持 Mermaid、PlantUML、Graphviz、D2 等主流图表语法。
            <span className="font-medium text-slate-900">本地渲染保护隐私</span>，
            <span className="font-medium text-slate-900">远程渲染支持更多格式</span>。
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/editor/"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-xl hover:shadow-sky-500/30"
            >
              <Zap className="h-5 w-5" />
              在线试用
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://github.com/LessUp/graph-viewer"
              target="_blank"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Github className="h-5 w-5" />
              GitHub 仓库
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
            <span>MIT 开源协议</span>
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-slate-900">简洁直观的编辑体验</h2>
            <p className="text-slate-600">实时预览、语法高亮、自动补全，让图表创作更加流畅</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="ml-4 flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-1 text-sm text-slate-400">
                <div className="h-4 w-4" />
                graphviewer.app/editor
              </div>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-2">
              {/* Editor Side */}
              <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                  {CODE_EXAMPLES.map((ex, idx) => (
                    <button
                      key={ex.name}
                      onClick={() => setActiveTab(idx)}
                      className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                        activeTab === idx
                          ? 'border-b-2 border-sky-500 text-sky-600'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
                <div className="bg-slate-900 p-4">
                  <pre className="overflow-x-auto text-sm leading-relaxed">
                    <code className="text-slate-300">{CODE_EXAMPLES[activeTab]?.code ?? ''}</code>
                  </pre>
                </div>
              </div>

              {/* Preview Side */}
              <div className="bg-slate-50 p-8">
                <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white">
                  <div className="text-center">
                    <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
                      <Sparkles className="h-8 w-8 text-sky-500" />
                    </div>
                    <p className="text-slate-500">实时预览区域</p>
                    <Link
                      href="/editor/"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700"
                    >
                      立即体验 <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">强大而灵活的功能</h2>
            <p className="text-lg text-slate-600">满足个人开发者和企业团队的各种图表需求</p>
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
            <h2 className="mb-4 text-3xl font-bold text-slate-900">支持 16+ 图表引擎</h2>
            <p className="text-lg text-slate-600">
              从简单的流程图到复杂的数据可视化，一个工具全搞定
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {ENGINE_DISPLAY_CATEGORIES.map((category) => (
              <div key={category.name} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{category.name}</h3>
                <p className="mb-4 text-sm text-slate-500">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.engines.map((engineId) => {
                    const config = ENGINE_CONFIGS[engineId];
                    if (!config) return null;
                    const isLocal = LOCAL_ENGINES.includes(engineId);
                    return (
                      <div
                        key={engineId}
                        className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors hover:border-sky-200 hover:bg-sky-50"
                      >
                        <Code className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-700">{config.label}</span>
                        {isLocal && (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                            本地
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
            <span className="font-medium">💡 提示：</span>
            标注"本地"的引擎在 GitHub Pages 演示版中完全可用，无需后端服务。 完整版 Docker
            部署支持全部 16+ 引擎和 PNG/PDF 导出。
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <section id="deployment" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">选择适合你的部署方式</h2>
            <p className="text-lg text-slate-600">从免费演示到完整生产环境，灵活满足各种需求</p>
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
                      当前
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
                    演示版（GitHub Pages）功能限制说明
                  </h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-200/60 bg-amber-50/30">
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">功能对比</th>
                      <th className="px-6 py-3 text-left font-semibold text-amber-700">
                        <span className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          演示版（当前）
                        </span>
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-sky-700">
                        <span className="flex items-center gap-1">
                          <Server className="h-4 w-4" />
                          Docker 完整版
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
                  <span className="font-medium">💡 提示：</span>
                  演示版使用本地 WASM 渲染引擎，数据完全在浏览器中处理，保护隐私安全。
                  如需完整功能，建议
                  <Link
                    href="https://github.com/LessUp/graph-viewer#deployment"
                    target="_blank"
                    className="mx-1 font-medium underline hover:text-amber-900"
                  >
                    部署 Docker 完整版
                  </Link>
                  。
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">准备好开始了吗？</h2>
          <p className="mb-8 text-lg text-slate-300">
            {isStaticExport
              ? '当前为演示版，支持 3 个本地渲染引擎。部署完整版可解锁全部 16+ 引擎和高级功能。'
              : '无需注册，立即在浏览器中体验。或者部署自己的实例获得完整功能。'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/editor/"
              className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:bg-slate-100"
            >
              <Zap className="h-5 w-5" />
              {isStaticExport ? '在演示版中试用' : '立即试用'}
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
              {isStaticExport ? '部署完整版' : 'Star on GitHub'}
            </Link>
          </div>

          {isStaticExport && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <span>演示版功能受限，</span>
              <Link href="#deployment" className="font-medium underline hover:text-amber-200">
                查看详细对比
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
              <p className="text-sm text-slate-500">现代图表可视化工具，开源免费，开箱即用。</p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-slate-900">产品</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/editor/" className="hover:text-sky-600">
                    在线试用
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-sky-600">
                    功能特性
                  </Link>
                </li>
                <li>
                  <Link href="#engines" className="hover:text-sky-600">
                    支持引擎
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-slate-900">资源</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link
                    href="https://github.com/LessUp/graph-viewer"
                    target="_blank"
                    className="hover:text-sky-600"
                  >
                    GitHub 仓库
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/LessUp/graph-viewer/blob/master/README.zh-CN.md"
                    target="_blank"
                    className="hover:text-sky-600"
                  >
                    使用文档
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/LessUp/graph-viewer/issues"
                    target="_blank"
                    className="hover:text-sky-600"
                  >
                    问题反馈
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-slate-900">技术</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <span className="text-slate-400">Next.js 15</span>
                </li>
                <li>
                  <span className="text-slate-400">React 19</span>
                </li>
                <li>
                  <span className="text-slate-400">WASM 本地渲染</span>
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
