/**
 * Diagram Templates Module
 *
 * Provides pre-defined diagram templates for quick diagram creation.
 * Templates include metadata for categorization and display.
 */

import type { Engine } from './diagramConfig';

// ============================================================================
// Types
// ============================================================================

/**
 * Template category for grouping templates in the UI
 */
export type TemplateCategory = {
  id: string;
  name: string; // Display name in Chinese
  order: number; // For sorting in UI
};

/**
 * Pre-defined diagram template with metadata
 */
export type DiagramTemplate = {
  id: string;
  name: string; // Template display name (Chinese)
  engine: Engine; // Diagram engine
  code: string; // Template code
  category: TemplateCategory['id'];
  description?: string; // Brief description
};

// ============================================================================
// Template Categories
// ============================================================================

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'flowchart', name: '流程图', order: 1 },
  { id: 'sequence', name: '时序图', order: 2 },
  { id: 'architecture', name: '架构图', order: 3 },
  { id: 'dataviz', name: '数据可视化', order: 4 },
  { id: 'network', name: '网络拓扑', order: 5 },
  { id: 'other', name: '其他', order: 99 },
];

// ============================================================================
// Templates
// ============================================================================

export const TEMPLATES: DiagramTemplate[] = [
  // --- 流程图 (Flowchart) ---
  {
    id: 'mermaid-flowchart-basic',
    name: '基础流程图',
    engine: 'mermaid',
    category: 'flowchart',
    description: '简单的条件判断流程图',
    code: `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[跳过]
    C --> E[记录日志]
    D --> E
    E --> F[结束]

    style A fill:#e1f5fe
    style F fill:#c8e6c9`,
  },
  {
    id: 'mermaid-flowchart-swimlane',
    name: '泳道流程图',
    engine: 'mermaid',
    category: 'flowchart',
    description: '跨部门协作流程示例',
    code: `graph TB
    subgraph 用户端
      A[发起请求] --> B[填写表单]
    end

    subgraph 前端服务
      B --> C[数据验证]
      C --> D[格式转换]
    end

    subgraph 后端服务
      D --> E[业务处理]
      E --> F{审核结果}
      F -->|通过| G[保存数据]
      F -->|拒绝| H[返回错误]
    end

    subgraph 数据层
      G --> I[(数据库)]
    end`,
  },
  {
    id: 'graphviz-flowchart',
    name: 'Graphviz 流程图',
    engine: 'graphviz',
    category: 'flowchart',
    description: '使用 DOT 语法的流程图',
    code: `digraph G {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fillcolor="#e3f2fd"];
  edge [color="#1976d2"];

  Start [label="开始", shape=ellipse, fillcolor="#c8e6c9"];
  Process [label="处理数据"];
  Decision [label="是否完成?", shape=diamond];
  End [label="结束", shape=ellipse, fillcolor="#ffcdd2"];

  Start -> Process;
  Process -> Decision;
  Decision -> Process [label="否"];
  Decision -> End [label="是"];
}`,
  },
  {
    id: 'flowchart-basic',
    name: 'Flowchart.js 流程图',
    engine: 'flowchart',
    category: 'flowchart',
    description: '简单线性流程',
    code: `st=>start: 开始
op1=>operation: 处理数据
cond=>condition: 是否继续?
op2=>operation: 执行操作
e=>end: 结束

st->op1->cond
cond(yes)->op2->e
cond(no)->op1`,
  },

  // --- 时序图 (Sequence) ---
  {
    id: 'mermaid-sequence-basic',
    name: '基础时序图',
    engine: 'mermaid',
    category: 'sequence',
    description: '简单的请求响应流程',
    code: `sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 点击按钮
    F->>B: POST /api/data
    B->>D: INSERT INTO
    D-->>B: 返回 ID
    B-->>F: 201 Created
    F-->>U: 显示成功`,
  },
  {
    id: 'mermaid-sequence-auth',
    name: '登录认证流程',
    engine: 'mermaid',
    category: 'sequence',
    description: 'JWT 认证时序',
    code: `sequenceDiagram
    autonumber
    participant C as 客户端
    participant A as Auth服务
    participant R as Resource服务

    C->>A: 1. 登录请求
    A->>A: 2. 验证凭证
    A-->>C: 3. 返回 JWT Token
    C->>R: 4. 请求资源
    Note right of C: Header: Bearer Token
    R->>R: 5. 验证 Token
    R-->>C: 6. 返回数据`,
  },
  {
    id: 'plantuml-sequence',
    name: 'PlantUML 时序图',
    engine: 'plantuml',
    category: 'sequence',
    description: 'API 调用时序',
    code: `@startuml
skinparam backgroundColor #FEFEFE
skinparam handwritten false

actor 用户 as User
participant "前端应用" as Frontend
participant "API 网关" as Gateway
database "数据库" as DB

User -> Frontend: 发起请求
Frontend -> Gateway: API 调用
Gateway -> DB: 查询数据
DB --> Gateway: 返回结果
Gateway --> Frontend: JSON 响应
Frontend --> User: 显示结果

note right of Gateway
  支持负载均衡
  和请求限流
end note
@enduml`,
  },

  // --- 架构图 (Architecture) ---
  {
    id: 'mermaid-architecture',
    name: '微服务架构',
    engine: 'mermaid',
    category: 'architecture',
    description: '微服务架构示意图',
    code: `graph TB
    subgraph 客户端层
      Web[Web应用]
      Mobile[移动端]
    end

    subgraph 网关层
      Gateway[API网关]
    end

    subgraph 服务层
      Auth[认证服务]
      User[用户服务]
      Order[订单服务]
      Pay[支付服务]
    end

    subgraph 数据层
      DB[(MySQL)]
      Cache[(Redis)]
      MQ[消息队列]
    end

    Web --> Gateway
    Mobile --> Gateway
    Gateway --> Auth & User & Order & Pay
    Auth --> Cache
    User --> DB
    Order --> DB & MQ
    Pay --> MQ`,
  },
  {
    id: 'graphviz-architecture',
    name: '系统架构图',
    engine: 'graphviz',
    category: 'architecture',
    description: '分层系统架构',
    code: `digraph G {
  rankdir=LR;
  node [shape=box, style="rounded,filled", fillcolor="#e3f2fd"];
  edge [color="#1976d2"];

  subgraph cluster_frontend {
    label="前端";
    style=filled;
    fillcolor="#fff3e0";
    React -> Redux;
    Redux -> Components;
  }

  subgraph cluster_backend {
    label="后端";
    style=filled;
    fillcolor="#e8f5e9";
    API -> Service;
    Service -> Database;
  }

  Components -> API [label="HTTP"];
}`,
  },
  {
    id: 'd2-architecture',
    name: 'D2 架构图',
    engine: 'd2',
    category: 'architecture',
    description: '简洁的架构描述',
    code: `direction: right

frontend: 前端 {
  react: React App
  state: State Management
}

backend: 后端 {
  api: REST API
  auth: 认证服务
  db: 数据库
}

frontend.react -> backend.api: HTTP 请求
backend.api -> backend.auth: 验证 Token
backend.api -> backend.db: 数据操作`,
  },

  // --- 数据可视化 (Data Visualization) ---
  {
    id: 'vegalite-bar',
    name: '柱状图',
    engine: 'vegalite',
    category: 'dataviz',
    description: '销售数据柱状图',
    code: `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "月度销售数据",
  "data": {
    "values": [
      {"月份": "1月", "销售额": 28},
      {"月份": "2月", "销售额": 55},
      {"月份": "3月", "销售额": 43},
      {"月份": "4月", "销售额": 91},
      {"月份": "5月", "销售额": 81}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "月份", "type": "nominal"},
    "y": {"field": "销售额", "type": "quantitative"}
  }
}`,
  },
  {
    id: 'vegalite-line',
    name: '折线图',
    engine: 'vegalite',
    category: 'dataviz',
    description: '趋势分析折线图',
    code: `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "股价走势",
  "data": {
    "values": [
      {"date": "2024-01", "price": 100},
      {"date": "2024-02", "price": 120},
      {"date": "2024-03", "price": 95},
      {"date": "2024-04", "price": 140},
      {"date": "2024-05", "price": 130}
    ]
  },
  "mark": "line",
  "encoding": {
    "x": {"field": "date", "type": "temporal"},
    "y": {"field": "price", "type": "quantitative"}
  }
}`,
  },
  {
    id: 'wavedrom-timing',
    name: '时序波形图',
    engine: 'wavedrom',
    category: 'dataviz',
    description: '数字信号时序图',
    code: `{ signal: [
  { name: "clk",  wave: "p......." },
  { name: "data", wave: "x.345x..", data: ["a", "b", "c"] },
  { name: "req",  wave: "0.1..0.." },
  { name: "ack",  wave: "1....10." }
]}`,
  },

  // --- 网络拓扑 (Network) ---
  {
    id: 'nwdiag-network',
    name: '网络拓扑图',
    engine: 'nwdiag',
    category: 'network',
    description: '服务器网络架构',
    code: `nwdiag {
  network internet {
    address = "210.x.x.x/24"
    web [address = "210.x.x.1"];
  }

  network internal {
    address = "172.x.x.x/24";
    web [address = "172.x.x.1"];
    db [address = "172.x.x.2"];
    cache [address = "172.x.x.3"];
  }
}`,
  },

  // --- 其他 (Other) ---
  {
    id: 'mermaid-mindmap',
    name: '思维导图',
    engine: 'mermaid',
    category: 'other',
    description: '项目规划思维导图',
    code: `mindmap
  root((项目规划))
    需求分析
      用户调研
      功能定义
    技术选型
      前端框架
      后端架构
      数据库
    开发计划
      Sprint 1
      Sprint 2
    测试上线
      单元测试
      部署发布`,
  },
  {
    id: 'erd-diagram',
    name: 'ER 图',
    engine: 'erd',
    category: 'other',
    description: '数据库实体关系图',
    code: `[Person]
*name
height
weight
+birth_location_id

[Location]
*id
city
state
country

Person *--1 Location`,
  },
  {
    id: 'nomnoml-diagram',
    name: 'UML 类图',
    engine: 'nomnoml',
    category: 'other',
    description: '类关系图',
    code: `[<frame>系统架构|
  [用户] -> [前端]
  [前端] -> [API网关]
  [API网关] -> [微服务A]
  [API网关] -> [微服务B]
  [微服务A] -> [数据库]
  [微服务B] -> [缓存]
]`,
  },
  {
    id: 'blockdiag-diagram',
    name: 'Blockdiag 流程图',
    engine: 'blockdiag',
    category: 'other',
    description: '块状流程图',
    code: `blockdiag {
  A -> B -> C -> D;
  A -> E -> F -> D;

  A [label = "开始"];
  B [label = "步骤1"];
  C [label = "步骤2"];
  D [label = "结束"];
  E [label = "备选1"];
  F [label = "备选2"];
}`,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get templates filtered by category
 */
export function getTemplatesByCategory(category: TemplateCategory['id']): DiagramTemplate[] {
  return TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get templates filtered by engine
 */
export function getTemplatesByEngine(engine: Engine): DiagramTemplate[] {
  return TEMPLATES.filter((t) => t.engine === engine);
}

/**
 * Get templates filtered by engines (for static export mode)
 */
export function getTemplatesByEngines(engines: readonly Engine[]): DiagramTemplate[] {
  return TEMPLATES.filter((t) => engines.includes(t.engine));
}

/**
 * Get templates grouped by category
 */
export function getTemplatesGroupedByCategory(): Map<TemplateCategory['id'], DiagramTemplate[]> {
  const groups = new Map<TemplateCategory['id'], DiagramTemplate[]>();

  for (const template of TEMPLATES) {
    const existing = groups.get(template.category) ?? [];
    existing.push(template);
    groups.set(template.category, existing);
  }

  return groups;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): DiagramTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * Get available categories that have templates
 */
export function getAvailableCategories(
  templates: DiagramTemplate[] = TEMPLATES,
): TemplateCategory[] {
  const usedCategories = new Set(templates.map((t) => t.category));
  return TEMPLATE_CATEGORIES.filter((c) => usedCategories.has(c.id)).sort(
    (a, b) => a.order - b.order,
  );
}
