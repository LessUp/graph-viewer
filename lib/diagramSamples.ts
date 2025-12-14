import type { Engine } from './diagramConfig';

export const SAMPLES: Record<Engine, string> = {
  mermaid: `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[跳过]
    C --> E[记录日志]
    D --> E
    E --> F[结束]
    
    style A fill:#e1f5fe
    style F fill:#c8e6c9`,

  plantuml: `@startuml
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

  graphviz: `digraph G {
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

  flowchart: `graph LR
    A[用户请求] --> B[负载均衡]
    B --> C[服务器1]
    B --> D[服务器2]
    C --> E[数据库主]
    D --> F[数据库从]
    E -.-> F`,

  d2: `direction: right

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

  nomnoml: `[<frame>系统架构|
  [用户] -> [前端]
  [前端] -> [API网关]
  [API网关] -> [微服务A]
  [API网关] -> [微服务B]
  [微服务A] -> [数据库]
  [微服务B] -> [缓存]
]`,

  ditaa: `+--------+   +-------+    +-------+
|        |   |       |    |       |
| 客户端 +-->| 网关  +--->| 服务  |
|        |   |       |    |       |
+--------+   +-------+    +---+---+
                              |
                              |
                          +---v---+
                          |       |
                          | 数据库|
                          |       |
                          +-------+`,

  blockdiag: `blockdiag {
  A -> B -> C -> D;
  A -> E -> F -> D;
  
  A [label = "开始"];
  B [label = "步骤1"];
  C [label = "步骤2"];
  D [label = "结束"];
  E [label = "备选1"];
  F [label = "备选2"];
}`,

  nwdiag: `nwdiag {
  network internet {
    address = "210.x.x.x/24"
    web [address = "210.x.x.1"];
  }

  network internal {
    address = "172.x.x.x/24";
    web [address = "172.x.x.1"];
    db [address = "172.x.x.2"];
  }
}`,

  actdiag: `actdiag {
  write -> convert -> image

  lane user {
    label = "用户"
    write [label = "编写代码"];
  }
  lane server {
    label = "服务器"
    convert [label = "转换处理"];
    image [label = "生成图片"];
  }
}`,

  seqdiag: `seqdiag {
  browser -> webserver [label = "GET /index.html"];
  browser <-- webserver;
  browser -> webserver [label = "POST /api/data"];
  browser <-- webserver;
}`,

  erd: `[Person]
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

  svgbob: `       .---.
      /-o-/--
   .-/ / /->
  ( *  \/
   '-.  \
      \ /
       '`,

  wavedrom: `{ signal: [
  { name: "clk",  wave: "p......." },
  { name: "data", wave: "x.345x..", data: ["a", "b", "c"] },
  { name: "req",  wave: "0.1..0.." },
  { name: "ack",  wave: "1....10." }
]}`,

  vega: `{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 400,
  "height": 200,
  "data": [
    {
      "name": "table",
      "values": [
        {"category": "A", "amount": 28},
        {"category": "B", "amount": 55},
        {"category": "C", "amount": 43}
      ]
    }
  ],
  "marks": [
    {
      "type": "rect",
      "from": {"data": "table"},
      "encode": {
        "enter": {
          "x": {"scale": "xscale", "field": "category"},
          "width": {"scale": "xscale", "band": 1},
          "y": {"scale": "yscale", "field": "amount"},
          "y2": {"scale": "yscale", "value": 0}
        }
      }
    }
  ],
  "scales": [
    {"name": "xscale", "type": "band", "domain": {"data": "table", "field": "category"}, "range": "width"},
    {"name": "yscale", "domain": {"data": "table", "field": "amount"}, "range": "height"}
  ]
}`,

  vegalite: `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "简单柱状图",
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
};
