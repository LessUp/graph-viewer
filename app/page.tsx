
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
    <main className="relative isolate mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-6 md:px-6 lg:gap-8 lg:py-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-30">
        <div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-sky-200 blur-[100px]" />
        <div className="absolute right-[-5%] top-[20%] h-[30rem] w-[30rem] rounded-full bg-indigo-200 blur-[100px]" />
      </div>

      {/* Header Section */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900/95 px-6 py-5 text-white shadow-xl ring-1 ring-white/10 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">GraphViewer</h1>
            <p className="text-xs text-slate-400">Mermaid · PlantUML · Graphviz 可视化工具</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
             onClick={handleImportWorkspaceClick}
             className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
          >
            导入项目
          </button>
          <button
             onClick={handleExportWorkspace}
             className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
          >
            导出项目
          </button>
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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:h-[calc(100vh-180px)]">
        {/* Left Sidebar: Diagrams List & Editor */}
        <div className="flex w-full flex-col gap-4 lg:w-[420px] lg:h-full lg:shrink-0">
          {/* Diagram List */}
          <div className="flex-shrink-0 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500">我的图表 ({diagrams.length})</span>
              <button
                onClick={handleCreateDiagram}
                className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新建
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:max-h-[120px]">
              {sortedDiagrams.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSelectDiagram(d.id)}
                  className={`group flex shrink-0 cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-all ${
                    d.id === currentId
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-600'
                  }`}
                >
                  <span className="truncate text-xs font-medium">{d.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDiagram(d.id, d.name);
                    }}
                    className="hidden text-slate-400 hover:text-rose-500 group-hover:block"
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
