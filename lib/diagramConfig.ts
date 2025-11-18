export type Engine = 'mermaid' | 'plantuml' | 'graphviz' | 'flowchart';
export type Format = 'svg' | 'png' | 'pdf';

export const ENGINES: Engine[] = ['mermaid', 'plantuml', 'graphviz', 'flowchart'];
export const ENGINE_SET: Set<Engine> = new Set(ENGINES);

export const FORMATS: Format[] = ['svg', 'png', 'pdf'];
export const FORMAT_SET: Set<Format> = new Set(FORMATS);

export const ENGINE_LABELS: Record<Engine, string> = {
  mermaid: 'Mermaid',
  flowchart: 'Flowchart.js',
  plantuml: 'PlantUML',
  graphviz: 'Graphviz',
};

export const FORMAT_LABELS: Record<Format, string> = {
  svg: 'SVG',
  png: 'PNG',
  pdf: 'PDF',
};

export type EngineConfig = {
  id: Engine;
  label: string;
  supportsLocalRender: boolean;
  krokiType: string;
};

export const ENGINE_CONFIGS: Record<Engine, EngineConfig> = {
  mermaid: {
    id: 'mermaid',
    label: ENGINE_LABELS.mermaid,
    supportsLocalRender: true,
    krokiType: 'mermaid',
  },
  flowchart: {
    id: 'flowchart',
    label: ENGINE_LABELS.flowchart,
    supportsLocalRender: true,
    krokiType: 'mermaid',
  },
  plantuml: {
    id: 'plantuml',
    label: ENGINE_LABELS.plantuml,
    supportsLocalRender: false,
    krokiType: 'plantuml',
  },
  graphviz: {
    id: 'graphviz',
    label: ENGINE_LABELS.graphviz,
    supportsLocalRender: true,
    krokiType: 'graphviz',
  },
};

export function isEngine(value: unknown): value is Engine {
  return typeof value === 'string' && (ENGINE_SET as Set<string>).has(value);
}

export function isFormat(value: unknown): value is Format {
  return typeof value === 'string' && (FORMAT_SET as Set<string>).has(value);
}

export function getKrokiType(engine: Engine): string {
  return ENGINE_CONFIGS[engine].krokiType;
}

export function canUseLocalRender(engine: Engine, format: Format): boolean {
  return ENGINE_CONFIGS[engine].supportsLocalRender && format === 'svg';
}
