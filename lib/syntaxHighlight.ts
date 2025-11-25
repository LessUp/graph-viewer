/**
 * 语法高亮配置 - 为不同的图表引擎提供 CodeMirror 语法高亮支持
 */

import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { StreamLanguage } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// Mermaid 语法定义
const mermaidLanguage = StreamLanguage.define({
  name: 'mermaid',
  startState: () => ({ inString: false, stringType: '' }),
  token: (stream, state) => {
    // 注释
    if (stream.match(/%%.*$/)) return 'comment';
    
    // 字符串
    if (stream.match(/"[^"]*"/) || stream.match(/'[^']*'/)) return 'string';
    
    // 图表类型关键字
    if (stream.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitgraph|mindmap|timeline|quadrantChart|requirementDiagram|C4Context|sankey-beta|xychart-beta)\b/i)) {
      return 'keyword';
    }
    
    // 方向关键字
    if (stream.match(/\b(TB|BT|LR|RL|TD)\b/)) return 'keyword';
    
    // 常用关键字
    if (stream.match(/\b(subgraph|end|participant|actor|note|loop|alt|else|opt|par|critical|break|rect|autonumber|title|section|dateFormat|axisFormat|excludes|includes|class|style|classDef|click|callback|linkStyle|direction)\b/i)) {
      return 'keyword';
    }
    
    // 箭头和连接符
    if (stream.match(/-->|---|==>|===|-.->|-.-|--o|--x|<-->|o--o|x--x|\|>|<\||\.\.>|<\.\.|\+\+|--|\*\*/)) {
      return 'operator';
    }
    
    // 节点 ID 和形状
    if (stream.match(/\[[^\]]*\]|\([^\)]*\)|\{[^\}]*\}|>\s*[^\]]+\s*\]|\(\([^\)]*\)\)|\[\[[^\]]*\]\]|\[\([^\)]*\)\]|\(\[[^\]]*\]\)/)) {
      return 'string';
    }
    
    // 数字
    if (stream.match(/\d+/)) return 'number';
    
    // 标识符
    if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) return 'variable';
    
    stream.next();
    return null;
  },
});

// PlantUML 语法定义
const plantumlLanguage = StreamLanguage.define({
  name: 'plantuml',
  startState: () => ({}),
  token: (stream) => {
    // 注释
    if (stream.match(/'.*$/)) return 'comment';
    if (stream.match(/\/'.*/)) return 'comment';
    
    // 字符串
    if (stream.match(/"[^"]*"/)) return 'string';
    
    // 开始和结束标记
    if (stream.match(/@startuml|@enduml|@startmindmap|@endmindmap|@startwbs|@endwbs|@startgantt|@endgantt|@startjson|@endjson|@startyaml|@endyaml/i)) {
      return 'meta';
    }
    
    // 关键字
    if (stream.match(/\b(actor|participant|boundary|control|entity|database|collections|queue|usecase|rectangle|package|node|folder|frame|cloud|agent|artifact|card|file|stack|component|interface|class|enum|abstract|annotation|circle|diamond|state|note|left|right|top|bottom|of|on|link|over|end|as|stereotype|skinparam|title|header|footer|legend|caption|newpage|activate|deactivate|destroy|return|create|alt|else|opt|loop|par|break|critical|group|ref|box|autonumber|autoactivate|hide|show|remove|restore|scale|rotate|split|detach|kill|allow_mixing)\b/i)) {
      return 'keyword';
    }
    
    // 颜色
    if (stream.match(/#[0-9a-fA-F]{3,8}\b/)) return 'color';
    
    // 箭头
    if (stream.match(/->|-->|<-|<--|<->|<-->|-\[#\w+\]->|\.\.>|<\.\.|\.\.|--|\*--|o--|<\|--|--\|>|#--|x--|}-|{-|\+-/)) {
      return 'operator';
    }
    
    // 数字
    if (stream.match(/\d+/)) return 'number';
    
    // 标识符
    if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) return 'variable';
    
    stream.next();
    return null;
  },
});

// Graphviz DOT 语法定义
const graphvizLanguage = StreamLanguage.define({
  name: 'dot',
  startState: () => ({ inString: false }),
  token: (stream, state) => {
    // 注释
    if (stream.match(/\/\/.*/)) return 'comment';
    if (stream.match(/\/\*/)) {
      while (!stream.match(/\*\//)) {
        if (stream.eol()) return 'comment';
        stream.next();
      }
      return 'comment';
    }
    if (stream.match(/#.*/)) return 'comment';
    
    // 字符串
    if (stream.match(/"(?:[^"\\]|\\.)*"/)) return 'string';
    
    // 图类型关键字
    if (stream.match(/\b(strict\s+)?(digraph|graph|subgraph)\b/i)) return 'keyword';
    
    // 属性关键字
    if (stream.match(/\b(node|edge|graph)\b/i)) return 'keyword';
    
    // 常用属性名
    if (stream.match(/\b(label|color|fillcolor|fontcolor|fontname|fontsize|shape|style|width|height|fixedsize|rank|rankdir|bgcolor|splines|overlap|nodesep|ranksep|margin|pad|ratio|size|orientation|center|compound|concentrate|ordering|peripheries|regular|sides|skew|distortion|penwidth|arrowhead|arrowsize|arrowtail|dir|headlabel|taillabel|labeldistance|labelangle|decorate|constraint|minlen|weight|samehead|sametail|headport|tailport|pos|xlabel|xlp|forcelabels|imagescale|image|labelloc|labeljust|layers|layer|layersep|clusterrank|newrank|remincross)\b/i)) {
      return 'property';
    }
    
    // 形状值
    if (stream.match(/\b(box|polygon|ellipse|oval|circle|point|egg|triangle|plaintext|plain|diamond|trapezium|parallelogram|house|pentagon|hexagon|septagon|octagon|doublecircle|doubleoctagon|tripleoctagon|invtriangle|invtrapezium|invhouse|Mdiamond|Msquare|Mcircle|rect|rectangle|square|star|underline|cylinder|note|tab|folder|box3d|component|promoter|cds|terminator|utr|primersite|restrictionsite|fivepoverhang|threepoverhang|noverhang|assembly|signature|insulator|ribosite|rnastab|proteasesite|proteinstab|rpromoter|rarrow|larrow|lpromoter|record|Mrecord|none)\b/i)) {
      return 'string';
    }
    
    // 箭头
    if (stream.match(/->|--/)) return 'operator';
    
    // 数字
    if (stream.match(/-?\d+\.?\d*/)) return 'number';
    
    // HTML 标签
    if (stream.match(/<[^>]+>/)) return 'tag';
    
    // 标识符
    if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) return 'variable';
    
    stream.next();
    return null;
  },
});

// Flowchart 语法（类似 Mermaid）
const flowchartLanguage = mermaidLanguage;

// 高亮主题
export const diagramHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#7c3aed', fontWeight: 'bold' },
  { tag: t.string, color: '#059669' },
  { tag: t.comment, color: '#9ca3af', fontStyle: 'italic' },
  { tag: t.number, color: '#dc2626' },
  { tag: t.operator, color: '#0284c7', fontWeight: 'bold' },
  { tag: t.variableName, color: '#1e293b' },
  { tag: t.propertyName, color: '#c026d3' },
  { tag: t.meta, color: '#ea580c', fontWeight: 'bold' },
  { tag: t.tagName, color: '#0369a1' },
  { tag: t.color, color: '#be185d' },
]);

// 导出各引擎的语言扩展
export const languageExtensions = {
  mermaid: [mermaidLanguage, syntaxHighlighting(diagramHighlightStyle)],
  plantuml: [plantumlLanguage, syntaxHighlighting(diagramHighlightStyle)],
  graphviz: [graphvizLanguage, syntaxHighlighting(diagramHighlightStyle)],
  flowchart: [flowchartLanguage, syntaxHighlighting(diagramHighlightStyle)],
  d2: [graphvizLanguage, syntaxHighlighting(diagramHighlightStyle)], // D2 语法与 Graphviz 类似
  excalidraw: [], // JSON 格式
  nomnoml: [mermaidLanguage, syntaxHighlighting(diagramHighlightStyle)], // 类似 Mermaid
  default: [],
};

export type SupportedLanguage = keyof typeof languageExtensions;

export function getLanguageExtension(engine: string) {
  return languageExtensions[engine as SupportedLanguage] || languageExtensions.default;
}
