/**
 * RendererStrategy - 渲染器策略
 *
 * 组合多个渲染器，按优先级选择合适的渲染器
 */

import type { Engine, Format } from '@/lib/diagramConfig';
import type { Renderer, RenderInput, RenderOutput } from './types';
import { RenderError } from './types';
import { ErrorCode } from '@/lib/errors';
import { LocalWasmRenderer, localWasmRenderer } from './LocalWasmRenderer';
import { RemoteKrokiRenderer } from './RemoteKrokiRenderer';

export type RendererStrategyConfig = {
  enableRemoteRendering: boolean;
};

export class RendererStrategy implements Renderer {
  private readonly renderers: Renderer[];

  constructor(
    localRenderer: LocalWasmRenderer,
    remoteRenderer: RemoteKrokiRenderer,
    _config: RendererStrategyConfig,
  ) {
    this.renderers = [localRenderer, remoteRenderer];
  }

  canRender(engine: Engine, format: Format): boolean {
    return this.renderers.some((renderer) => renderer.canRender(engine, format));
  }

  async render(input: RenderInput, signal?: AbortSignal): Promise<RenderOutput> {
    const { engine, format } = input;

    for (const renderer of this.renderers) {
      if (renderer.canRender(engine, format)) {
        try {
          const result = await renderer.render(input, signal);
          return result;
        } catch (error: unknown) {
          if (error instanceof RenderError && error.code === ErrorCode.ABORTED) {
            throw error;
          }
          
          // 如果本地渲染失败，继续尝试下一个渲染器
          // 如果远程渲染失败或不可用，抛出错误
          if (renderer === this.renderers[this.renderers.length - 1]) {
            throw error;
          }
        }
      }
    }

    throw new RenderError(ErrorCode.UNSUPPORTED_FORMAT);
  }

  getAvailableRenderers(engine: Engine, format: Format): string[] {
    return this.renderers
      .filter((r) => r.canRender(engine, format))
      .map((r) => r.constructor.name);
  }
}

export function createRendererStrategy(config: RendererStrategyConfig): RendererStrategy {
  const localRenderer = localWasmRenderer;
  const remoteRenderer = new RemoteKrokiRenderer(config.enableRemoteRendering);
  return new RendererStrategy(localRenderer, remoteRenderer, config);
}
