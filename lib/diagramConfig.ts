export type Engine = 
  | 'mermaid' 
  | 'plantuml' 
  | 'graphviz' 
  | 'flowchart'
  | 'd2'
  | 'nomnoml'
  | 'ditaa'
  | 'blockdiag'
  | 'nwdiag'
  | 'actdiag'
  | 'seqdiag'
  | 'erd'
  | 'svgbob'
  | 'wavedrom'
  | 'vega'
  | 'vegalite';

export type Format = 'svg' | 'png' | 'pdf';

export const ENGINES: Engine[] = [
  'mermaid', 
  'plantuml', 
  'graphviz', 
  'flowchart',
  'd2',
  'nomnoml',
  'ditaa',
  'blockdiag',
  'nwdiag',
  'actdiag',
  'seqdiag',
  'erd',
  'svgbob',
  'wavedrom',
  'vega',
  'vegalite',
];
export const ENGINE_SET: Set<Engine> = new Set(ENGINES);

export const FORMATS: Format[] = ['svg', 'png', 'pdf'];
export const FORMAT_SET: Set<Format> = new Set(FORMATS);

export const ENGINE_LABELS: Record<Engine, string> = {
  mermaid: 'Mermaid',
  flowchart: 'Flowchart.js',
  plantuml: 'PlantUML',
  graphviz: 'Graphviz (DOT)',
  d2: 'D2',
  nomnoml: 'Nomnoml',
  ditaa: 'Ditaa',
  blockdiag: 'BlockDiag',
  nwdiag: 'NwDiag (网络图)',
  actdiag: 'ActDiag (活动图)',
  seqdiag: 'SeqDiag (时序图)',
  erd: 'ERD (实体关系图)',
  svgbob: 'SVGBob (ASCII)',
  wavedrom: 'WaveDrom (波形图)',
  vega: 'Vega',
  vegalite: 'Vega-Lite',
};

export const ENGINE_CATEGORIES: Record<string, Engine[]> = {
  '常用图表': ['mermaid', 'plantuml', 'graphviz', 'd2'],
  '流程图系列': ['flowchart', 'blockdiag', 'actdiag'],
  '时序与网络': ['seqdiag', 'nwdiag'],
  '数据可视化': ['vega', 'vegalite', 'wavedrom'],
  'ASCII 艺术': ['ditaa', 'svgbob', 'nomnoml'],
  '数据建模': ['erd'],
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
  description?: string;
  docUrl?: string;
};

export const ENGINE_CONFIGS: Record<Engine, EngineConfig> = {
  mermaid: {
    id: 'mermaid',
    label: ENGINE_LABELS.mermaid,
    supportsLocalRender: true,
    krokiType: 'mermaid',
    description: '支持流程图、时序图、类图、甘特图等多种图表',
    docUrl: 'https://mermaid.js.org/',
  },
  flowchart: {
    id: 'flowchart',
    label: ENGINE_LABELS.flowchart,
    supportsLocalRender: true,
    krokiType: 'mermaid',
    description: '简单易用的流程图语法',
  },
  plantuml: {
    id: 'plantuml',
    label: ENGINE_LABELS.plantuml,
    supportsLocalRender: false,
    krokiType: 'plantuml',
    description: 'UML 图表专家，支持类图、用例图、组件图等',
    docUrl: 'https://plantuml.com/',
  },
  graphviz: {
    id: 'graphviz',
    label: ENGINE_LABELS.graphviz,
    supportsLocalRender: true,
    krokiType: 'graphviz',
    description: '强大的图形可视化工具，使用 DOT 语言',
    docUrl: 'https://graphviz.org/',
  },
  d2: {
    id: 'd2',
    label: ENGINE_LABELS.d2,
    supportsLocalRender: false,
    krokiType: 'd2',
    description: '现代声明式图表语言，简洁直观',
    docUrl: 'https://d2lang.com/',
  },
  nomnoml: {
    id: 'nomnoml',
    label: ENGINE_LABELS.nomnoml,
    supportsLocalRender: false,
    krokiType: 'nomnoml',
    description: '简洁的 UML 绘图工具',
    docUrl: 'https://nomnoml.com/',
  },
  ditaa: {
    id: 'ditaa',
    label: ENGINE_LABELS.ditaa,
    supportsLocalRender: false,
    krokiType: 'ditaa',
    description: '将 ASCII 艺术转换为精美图表',
  },
  blockdiag: {
    id: 'blockdiag',
    label: ENGINE_LABELS.blockdiag,
    supportsLocalRender: false,
    krokiType: 'blockdiag',
    description: '简单的块状图生成器',
  },
  nwdiag: {
    id: 'nwdiag',
    label: ENGINE_LABELS.nwdiag,
    supportsLocalRender: false,
    krokiType: 'nwdiag',
    description: '网络拓扑图绘制工具',
  },
  actdiag: {
    id: 'actdiag',
    label: ENGINE_LABELS.actdiag,
    supportsLocalRender: false,
    krokiType: 'actdiag',
    description: '活动图生成器',
  },
  seqdiag: {
    id: 'seqdiag',
    label: ENGINE_LABELS.seqdiag,
    supportsLocalRender: false,
    krokiType: 'seqdiag',
    description: '简单的时序图绘制工具',
  },
  erd: {
    id: 'erd',
    label: ENGINE_LABELS.erd,
    supportsLocalRender: false,
    krokiType: 'erd',
    description: '实体关系图绘制工具',
  },
  svgbob: {
    id: 'svgbob',
    label: ENGINE_LABELS.svgbob,
    supportsLocalRender: false,
    krokiType: 'svgbob',
    description: '将 ASCII 文本转换为 SVG 图形',
  },
  wavedrom: {
    id: 'wavedrom',
    label: ENGINE_LABELS.wavedrom,
    supportsLocalRender: false,
    krokiType: 'wavedrom',
    description: '数字时序波形图生成器',
    docUrl: 'https://wavedrom.com/',
  },
  vega: {
    id: 'vega',
    label: ENGINE_LABELS.vega,
    supportsLocalRender: false,
    krokiType: 'vega',
    description: '声明式可视化语法',
    docUrl: 'https://vega.github.io/vega/',
  },
  vegalite: {
    id: 'vegalite',
    label: ENGINE_LABELS.vegalite,
    supportsLocalRender: false,
    krokiType: 'vegalite',
    description: '高级交互式可视化语法',
    docUrl: 'https://vega.github.io/vega-lite/',
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
