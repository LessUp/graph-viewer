'use client';

import { useMemo, useCallback, memo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { getLanguageExtension } from '@/lib/syntaxHighlight';
import type { Engine } from '@/lib/diagramConfig';

export type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onCtrlEnter?: () => void;
  engine?: Engine;
  minHeight?: string;
  maxHeight?: string;
  fontSize?: number;
};

// 自定义编辑器主题 - 美化样式
const editorTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    backgroundColor: 'transparent',
  },
  '.cm-content': {
    fontFamily: 'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    padding: '16px 0',
    caretColor: '#3b82f6',
  },
  '.cm-line': {
    padding: '0 16px',
    lineHeight: '1.6',
  },
  '.cm-gutters': {
    backgroundColor: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    color: '#94a3b8',
    fontSize: '12px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#dbeafe !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#bfdbfe !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#3b82f6',
    borderLeftWidth: '2px',
  },
  '.cm-matchingBracket': {
    backgroundColor: '#fef3c7',
    outline: '1px solid #fbbf24',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: '#e0f2fe',
    border: '1px solid #7dd3fc',
    color: '#0284c7',
    borderRadius: '4px',
    padding: '0 6px',
    margin: '0 4px',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
});

function CodeEditorComponent(props: CodeEditorProps) {
  const { 
    value, 
    onChange, 
    disabled, 
    onCtrlEnter,
    engine = 'mermaid',
    minHeight = '300px',
    maxHeight,
    fontSize = 13,
  } = props;

  // 简化扩展配置，避免版本冲突
  const extensions = useMemo(() => {
    const ext = [
      editorTheme,
      EditorView.lineWrapping,
    ];
    
    // 安全地添加语言扩展
    try {
      const langExt = getLanguageExtension(engine);
      if (langExt && Array.isArray(langExt)) {
        ext.push(...langExt);
      }
    } catch (e) {
      console.warn('Language extension error:', e);
    }
    
    return ext;
  }, [engine]);

  const handleChange = useCallback((val: string) => {
    onChange(val);
  }, [onChange]);

  // 处理快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onCtrlEnter) {
      e.preventDefault();
      onCtrlEnter();
    }
  }, [onCtrlEnter]);

  return (
    <div 
      className="code-editor-wrapper w-full rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-300"
      style={{ 
        minHeight,
        maxHeight: maxHeight || undefined,
      }}
      onKeyDown={handleKeyDown}
    >
      <CodeMirror
        value={value}
        editable={!disabled}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
        }}
        theme="light"
        height="100%"
        style={{ 
          fontSize: `${fontSize}px`,
          minHeight,
          maxHeight: maxHeight || undefined,
        }}
        onChange={handleChange}
        extensions={extensions}
      />
    </div>
  );
}

// 使用 memo 优化性能
export const CodeEditor = memo(CodeEditorComponent);
export default CodeEditor;
