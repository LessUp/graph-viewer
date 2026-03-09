import type { Engine, Format } from './diagramConfig';

/**
 * 工作区中的单个图表文档
 */
export type DiagramDoc = {
  id: string;
  name: string;
  engine: Engine;
  format: Format;
  code: string;
  updatedAt: string;
};
