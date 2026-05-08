/**
 * Render 模块统一入口
 */

export type { Renderer, RenderInput, RenderOutput, RendererCapabilities } from './types';
export { RenderError } from './types';

export { LocalWasmRenderer, localWasmRenderer } from './LocalWasmRenderer';
export { RemoteKrokiRenderer, remoteKrokiRenderer } from './RemoteKrokiRenderer';
export { RendererStrategy, createRendererStrategy } from './RendererStrategy';
export type { RendererStrategyConfig } from './RendererStrategy';
