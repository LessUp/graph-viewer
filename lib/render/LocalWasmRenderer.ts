/**
 * LocalWasmRenderer - 本地 WASM 渲染器
 *
 * 使用浏览器本地 WASM 引擎（Mermaid / Graphviz）进行渲染
 */

import type { Engine, Format } from '@/lib/diagramConfig';
import { canUseLocalRender } from '@/lib/diagramConfig';
import type { Renderer, RenderInput, RenderOutput } from './types';
import { RenderError } from './types';
import { ErrorCode } from '@/lib/errors';

type MermaidApi = {
  initialize?: (cfg: Record<string, unknown>) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
};

type GraphvizApi = {
  wasmFolder?: (url: string) => void;
  load?: () => Promise<void>;
  layout: (code: string, format: string, engine: string) => Promise<string>;
};

const GRAPHVIZ_WASM_BASE_URL =
  process.env.NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL ||
  'https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist';

let mermaidPromise: Promise<MermaidApi> | null = null;
let graphvizPromise: Promise<GraphvizApi> | null = null;

async function loadMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
      .then((module) => {
        const mermaid = (module?.default ?? module) as MermaidApi;
        if (mermaid?.initialize) {
          mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });
        }
        return mermaid;
      })
      .catch((error) => {
        mermaidPromise = null;
        throw error;
      });
  }
  return mermaidPromise;
}

async function loadGraphviz(): Promise<GraphvizApi> {
  if (!graphvizPromise) {
    graphvizPromise = import('@hpcc-js/wasm')
      .then(async (module) => {
        const mod = module as Record<string, unknown>;
        const g = (mod.graphviz ?? module) as GraphvizApi;
        if (g?.wasmFolder) {
          g.wasmFolder(GRAPHVIZ_WASM_BASE_URL);
        }
        if (g?.load) {
          await g.load();
        }
        return g;
      })
      .catch((error) => {
        graphvizPromise = null;
        throw error;
      });
  }
  return graphvizPromise;
}

export class LocalWasmRenderer implements Renderer {
  canRender(engine: Engine, format: Format): boolean {
    return canUseLocalRender(engine, format);
  }

  async render(input: RenderInput, signal?: AbortSignal): Promise<RenderOutput> {
    const { engine, code } = input;

    if (signal?.aborted) {
      throw new RenderError(ErrorCode.ABORTED);
    }

    try {
      if (engine === 'graphviz') {
        return await this.renderGraphviz(code, signal);
      }

      if (engine === 'mermaid' || engine === 'flowchart') {
        return await this.renderMermaid(code, signal);
      }

      throw new RenderError(ErrorCode.UNSUPPORTED_FORMAT);
    } catch (error: unknown) {
      if (error instanceof RenderError) {
        throw error;
      }
      throw new RenderError(ErrorCode.LOCAL_RENDER_FAILED, {
        originalMessage: error instanceof Error ? error.message : '本地渲染失败',
      });
    }
  }

  private async renderMermaid(code: string, signal?: AbortSignal): Promise<RenderOutput> {
    const mermaid = await loadMermaid();
    if (!mermaid?.render) {
      throw new RenderError(ErrorCode.LOCAL_RENDER_FAILED);
    }

    if (signal?.aborted) {
      throw new RenderError(ErrorCode.ABORTED);
    }

    const id = `mmd-${Date.now()}`;
    const result = await mermaid.render(id, code);

    if (!result?.svg) {
      throw new RenderError(ErrorCode.LOCAL_RENDER_FAILED);
    }

    return {
      contentType: 'image/svg+xml',
      svg: result.svg as string,
      base64: '',
    };
  }

  private async renderGraphviz(code: string, signal?: AbortSignal): Promise<RenderOutput> {
    const gv = await loadGraphviz();
    if (!gv?.layout) {
      throw new RenderError(ErrorCode.LOCAL_RENDER_FAILED);
    }

    if (signal?.aborted) {
      throw new RenderError(ErrorCode.ABORTED);
    }

    const svgText = await gv.layout(code, 'svg', 'dot');

    if (!svgText) {
      throw new RenderError(ErrorCode.LOCAL_RENDER_FAILED);
    }

    return {
      contentType: 'image/svg+xml',
      svg: svgText as string,
      base64: '',
    };
  }
}

export const localWasmRenderer = new LocalWasmRenderer();
