'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Globe,
  Server,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  Info,
  Shield,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { ENGINE_CONFIGS, LOCAL_RENDER_ENGINES } from '@/lib/diagramConfig';

const LOCAL_RENDER_ENGINE_LABELS = LOCAL_RENDER_ENGINES.map(
  (engine) => ENGINE_CONFIGS[engine].label,
);

const LIMITATIONS = [
  {
    icon: Cpu,
    title: `仅 ${LOCAL_RENDER_ENGINE_LABELS.length} 个引擎可用`,
    desc: `${LOCAL_RENDER_ENGINE_LABELS.join('、')}（本地 WASM 渲染）`,
    available: true,
  },
  {
    icon: Shield,
    title: '仅 SVG 导出',
    desc: '不支持 PNG、PDF 等格式的远程渲染导出',
    available: false,
  },
  {
    icon: Sparkles,
    title: 'AI 功能不可用',
    desc: '需要后端服务的代码分析和生成功能',
    available: false,
  },
  {
    icon: Server,
    title: '无远程引擎',
    desc: 'PlantUML、D2、Vega 等 13+ 引擎需要完整版',
    available: false,
  },
];

const AVAILABLE_FEATURES = [
  '本地 WASM 渲染，数据不上传',
  '多图表工作区和版本历史',
  'LZ-string 压缩分享链接',
  '主题切换和编辑器设置',
];

export function StaticExportNotice() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50/30 shadow-lg shadow-amber-500/5">
      {/* Decorative elements */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-200/20 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-orange-200/20 blur-xl" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 shadow-sm">
            <Globe className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-amber-900">演示版</h3>
                  <span className="inline-flex items-center gap-1 rounded bg-amber-200/60 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                    <AlertTriangle className="h-3 w-3" />
                    功能受限
                  </span>
                </div>
                <p className="mt-1 text-sm text-amber-800/80">
                  当前为 GitHub Pages 静态演示版本，仅支持本地渲染的 3 个引擎
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsDismissed(true)}
                className="shrink-0 rounded-lg p-1.5 text-amber-400 transition-colors hover:bg-amber-100 hover:text-amber-600"
                aria-label="关闭提示"
                title="关闭提示"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="https://github.com/LessUp/graph-viewer#deployment"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/30"
              >
                <Server className="h-4 w-4" />
                部署完整版
                <ExternalLink className="h-3 w-3" />
              </Link>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white/50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-white hover:text-amber-800"
              >
                <Info className="h-4 w-4" />
                {showDetails ? '收起详情' : '查看详情'}
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              <Link
                href="/"
                className="text-sm font-medium text-amber-600 transition-colors hover:text-amber-800 hover:underline"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>

        {/* Expandable details */}
        {showDetails && (
          <div className="animate-in slide-in-from-top-2 mt-5 border-t border-amber-200/60 pt-4 duration-200">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Limitations */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  当前受限功能
                </h4>
                <ul className="space-y-2.5">
                  {LIMITATIONS.map((item) => (
                    <li
                      key={item.title}
                      className={`flex items-start gap-2.5 rounded-lg p-2 ${
                        item.available ? 'bg-green-50/50' : 'bg-amber-100/30'
                      }`}
                    >
                      {item.available ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/70" />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            item.available ? 'text-green-800' : 'text-amber-900/70'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-amber-700/60">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Available features */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-900">
                  <Shield className="h-4 w-4 text-green-600" />
                  演示版可用功能
                </h4>
                <ul className="space-y-2">
                  {AVAILABLE_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-green-800">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 rounded-lg bg-amber-100/40 p-3">
                  <p className="text-xs leading-relaxed text-amber-800">
                    <span className="font-medium">💡 为什么受限？</span>
                    <br />
                    GitHub Pages 仅支持静态文件，无法运行后端服务。 完整功能需要 Docker 部署 Kroki
                    渲染服务。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick tags - always visible */}
        {!showDetails && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-amber-200/60 pt-3">
            <span className="text-xs font-medium text-amber-700">当前可用引擎：</span>
            {LOCAL_RENDER_ENGINE_LABELS.map((engine) => (
              <span
                key={engine}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
              >
                <Check className="h-3 w-3" />
                {engine}
              </span>
            ))}
            <span className="mx-1 text-amber-300">|</span>
            <span className="text-xs text-amber-600">
              需要更多？
              <Link
                href="https://github.com/LessUp/graph-viewer#deployment"
                target="_blank"
                className="ml-1 font-medium underline hover:text-amber-800"
              >
                部署完整版 →
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
