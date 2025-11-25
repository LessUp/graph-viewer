
'use client';

import { useEffect, useRef, useState } from 'react';
import { compressToEncodedURIComponent } from 'lz-string';
import { EditorPanel } from '@/components/EditorPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { useDiagramState } from '@/hooks/useDiagramState';
import { useDiagramRender } from '@/hooks/useDiagramRender';
import { SAMPLES } from '@/lib/diagramSamples';

export default function Page() {
  const {
    engine,
    format,
    code,
    codeStats,
    linkError,
    diagrams,
    currentId,
    setEngine,
    setFormat,
    setCode,
    setCurrentId,
    createDiagram,
    renameDiagram,
    deleteDiagram,
    importWorkspace,
  } = useDiagramState(SAMPLES['mermaid']);

  // 强制使用 SVG 格式以获得最佳体验，除非特定需求
  // 在新设计中，我们主要依赖前端导出，所以渲染格式首选 SVG
  useEffect(() => {
    if (format !== 'svg') {
      setFormat('svg');
    }
  }, [format, setFormat]);

  const {
    svg,
    base64,
    contentType,
    loading,
    error,
    canUseLocalRender,
    showPreview,
    renderDiagram,
    clearError,
    setError,
    resetOutput,
  } = useDiagramRender(engine, 'svg', code); // 强制传入 'svg' 给 render hook

  const [livePreview, setLivePreview] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const combinedError = error || linkError;

  const sortedDiagrams = [...diagrams].sort((a, b) => {
    const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return tb - ta;
  });

  useEffect(() => {
    if (!livePreview) {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }

    if (!code.trim()) {
      resetOutput();
      return;
    }

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      void renderDiagram();
    }, 800);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [livePreview, engine, code, renderDiagram, resetOutput]); // removed format dependency

  async function handleCopyShareLink() {
    clearError();
    try {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      const params = url.searchParams;
      params.set('engine', engine);
      // 默认为 svg，链接里可以不带，或者带上也行
      params.set('format', 'svg');
      if (code.trim()) {
        let value = code;
        try {
          const encoded = compressToEncodedURIComponent(code);
          if (encoded) {
            value = encoded;
            params.set('encoded', '1');
          } else {
            params.delete('encoded');
          }
        } catch {
          params.delete('encoded');
        }
        params.set('code', value);
      } else {
        params.delete('code');
        params.delete('encoded');
      }
      url.search = params.toString();
      const finalUrl = url.toString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(finalUrl);
      } else {
        window.prompt('请手动复制以下链接', finalUrl);
      }
    } catch (e: any) {
      setError(e?.message || '复制分享链接失败');
    }
  }

  async function handleCopyCode() {
    clearError();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        window.prompt('请手动复制以下代码', code);
      }
    } catch (e: any) {
      setError(e?.message || '复制代码失败');
    }
  }

  function handleClearCode() {
    setCode('');
    resetOutput();
  }

  function handleFormatCode() {
    if (!code) return;
    const formatted = code.replace(/\t/g, '  ');
    setCode(formatted);
  }

  function handleSelectDiagram(id: string) {
    if (!id || id === currentId) return;
    setCurrentId(id);
  }

  function handleCreateDiagram() {
    createDiagram();
  }

  function handleRenameDiagram(id: string, currentName: string) {
    if (typeof window === 'undefined') return;
    const next = window.prompt('请输入新的图名称', currentName || '');
    if (!next) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    renameDiagram(id, trimmed);
  }

  function handleDeleteDiagram(id: string, name: string) {
    if (typeof window === 'undefined') return;
    const label = name && name.trim().length > 0 ? name.trim() : '未命名图';
    const ok = window.confirm(`确定要删除图「${label}」吗？此操作不可撤销。`);
    if (!ok) return;
    deleteDiagram(id);
  }

  function handleExportWorkspace() {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        currentId,
        diagrams,
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `graphviewer-workspace-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || '导出项目集失败');
    }
  }

  function handleImportWorkspaceClick() {
    if (importInputRef.current) {
      importInputRef.current.value = '';
      importInputRef.current.click();
    }
  }

  async function handleImportWorkspaceChange(event: any) {
    try {
      const file: File | undefined = event?.target?.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text) as { diagrams?: any; currentId?: string };
      if (!Array.isArray(data.diagrams) || data.diagrams.length === 0) {
        throw new Error('导入的文件中不包含有效的图列表。');
      }
      importWorkspace({ diagrams: data.diagrams, currentId: data.currentId });
    } catch (e: any) {
      setError(e?.message || '导入项目集失败');
    } finally {
      if (event?.target) {
        event.target.value = '';
      }
    }
  }

  return (
    <main className="relative isolate mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-5 px-4 py-5 md:px-6 lg:gap-6 lg:py-6">
      {/* Header Section */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 text-white shadow-xl ring-1 ring-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 opacity-75 blur"></div>
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              GraphViewer
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Mermaid · PlantUML · Graphviz · Flowchart</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
             onClick={handleImportWorkspaceClick}
             className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all hover:scale-105"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            导入
          </button>
          <button
             onClick={handleExportWorkspace}
             className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all hover:scale-105"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-all hover:scale-105"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportWorkspaceChange}
          />
        </div>
      </header>

      {/* Workspace Section */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:h-[calc(100vh-140px)]">
        {/* Left Sidebar: Diagrams List & Editor */}
        <div className="flex w-full flex-col gap-4 lg:w-[460px] lg:h-full lg:shrink-0">
          {/* Diagram List */}
          <div className="flex-shrink-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100">
                  <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">我的图表</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{diagrams.length}</span>
              </div>
              <button
                onClick={handleCreateDiagram}
                className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-100 transition"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新建
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:max-h-[100px]">
              {sortedDiagrams.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSelectDiagram(d.id)}
                  className={`group flex shrink-0 cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition-all ${
                    d.id === currentId
                      ? 'border-sky-400 bg-gradient-to-r from-sky-50 to-indigo-50 text-sky-700 shadow-sm'
                      : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-sky-200 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${d.id === currentId ? 'bg-sky-500' : 'bg-slate-300'}`}></div>
                    <span className="truncate text-xs font-medium">{d.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDiagram(d.id, d.name);
                    }}
                    className="hidden rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 group-hover:block transition"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-[400px] lg:min-h-0">
            <EditorPanel
              engine={engine}
              code={code}
              codeStats={codeStats}
              loading={loading}
              error={combinedError}
              canUseLocalRender={canUseLocalRender}
              livePreviewEnabled={livePreview}
              onLivePreviewChange={setLivePreview}
              onEngineChange={setEngine}
              onCodeChange={setCode}
              onRender={renderDiagram}
              onCopyShareLink={handleCopyShareLink}
              onCopyCode={handleCopyCode}
              onClearCode={handleClearCode}
              onFormatCode={handleFormatCode}
            />
          </div>
        </div>

        {/* Right Content: Preview */}
        <div className="flex-1 h-[500px] lg:h-full">
          <PreviewPanel
            svg={svg}
            base64={base64}
            contentType={contentType}
            loading={loading}
            showPreview={showPreview}
            format={'svg'} // Force SVG for preview logic
          />
        </div>
      </div>
    </main>
  );
}
