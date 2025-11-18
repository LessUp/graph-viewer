import type { Engine } from '@/lib/diagramConfig';

export const SAMPLES: Record<Engine, string> = {
  mermaid: 'flowchart TD\nA[开始] --> B{条件?}\nB --是--> C[处理]\nB --否--> D[结束]',
  flowchart: 'flowchart TD\nA[Start] --> B{Is it?}\nB -- Yes --> C[OK]\nB -- No --> D[End]',
  graphviz: 'digraph G {\n  rankdir=LR;\n  A -> B -> C;\n  A -> D;\n}',
  plantuml: '@startuml\nstart\nif (条件?) then (是)\n  :处理;\nelse (否)\n  stop\nendif\n@enduml',
};
