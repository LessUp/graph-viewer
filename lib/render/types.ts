/**
 * Renderer 接口定义
 *
 * 统一的渲染器接口，允许本地和远程渲染器互换
 */

import type { Engine, Format } from '@/lib/diagramConfig';
import { ApiError, ErrorCode } from '@/lib/errors';

export type RenderOutput = {
  contentType: string;
  svg: string;
  base64: string;
};

export type RenderInput = {
  engine: Engine;
  format: Format;
  code: string;
  krokiBaseUrl?: string;
};

export type RendererCapabilities = {
  canRender(engine: Engine, format: Format): boolean;
};

export interface Renderer extends RendererCapabilities {
  render(input: RenderInput, signal?: AbortSignal): Promise<RenderOutput>;
}

export class RenderError extends ApiError {
  constructor(code: ErrorCode, context: Record<string, unknown> = {}) {
    super(code, context);
    this.name = 'RenderError';
  }
}
