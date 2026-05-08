/**
 * RemoteKrokiRenderer - 远程 Kroki 渲染器
 *
 * 通过 /api/render 代理调用远程 Kroki 服务
 */

import type { Engine, Format } from '@/lib/diagramConfig';
import type { Renderer, RenderInput, RenderOutput } from './types';
import { RenderError } from './types';
import { ErrorCode, createErrorFromResponse, isApiError } from '@/lib/errors';

export class RemoteKrokiRenderer implements Renderer {
  constructor(private readonly enabled: boolean = true) {}

  canRender(_engine: Engine, _format: Format): boolean {
    // 始终返回 true，即使被禁用，以便在 render 时给出明确的错误消息
    return true;
  }

  async render(input: RenderInput, signal?: AbortSignal): Promise<RenderOutput> {
    if (!this.enabled) {
      throw new RenderError(ErrorCode.REMOTE_DISABLED);
    }

    const { engine, format, code, krokiBaseUrl } = input;

    if (signal?.aborted) {
      throw new RenderError(ErrorCode.ABORTED);
    }

    try {
      const payload: Record<string, unknown> = { engine, format, code };
      const customBaseUrl = typeof krokiBaseUrl === 'string' ? krokiBaseUrl.trim() : '';
      if (customBaseUrl) {
        payload.krokiBaseUrl = customBaseUrl;
      }

      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw createErrorFromResponse(res, json);
      }

      const data = (await res.json()) as {
        contentType?: string;
        svg?: string;
        base64?: string;
      };

      return {
        contentType: data.contentType || '',
        svg: data.svg || '',
        base64: data.base64 || '',
      };
    } catch (error: unknown) {
      if (isApiError(error)) {
        throw new RenderError(error.code, error.context);
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new RenderError(ErrorCode.ABORTED);
      }
      throw new RenderError(ErrorCode.NETWORK_ERROR, {
        originalMessage: error instanceof Error ? error.message : '网络错误',
      });
    }
  }
}

export const remoteKrokiRenderer = new RemoteKrokiRenderer(true);
