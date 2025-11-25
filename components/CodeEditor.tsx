'use client';

import { useMemo, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { keymap, EditorView } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
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
  lineWrapping?: boolean;
  showLineNumbers?: boolean;
};

// 自定义编辑器主题
const editorTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    backgroundColor: 'transparent',
  },
  '.cm-content': {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    padding: '12px 0',
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.cm-gutters': {
    backgroundColor: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    color: '#94a3b8',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f1f5f9',
  },
  '.cm-activeLine': {
    backgroundColor: '#f8fafc',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#bfdbfe !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#93c5fd !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#3b82f6',
    borderLeftWidth: '2px',
  },
  '.cm-matchingBracket': {
    backgroundColor: '#fef3c7',
    outline: '1px solid #fbbf24',
  },
  '.cm-searchMatch': {
    backgroundColor: '#fef9c3',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#fde047',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: '#e0f2fe',
    border: '1px solid #7dd3fc',
    color: '#0284c7',
    borderRadius: '4px',
    padding: '0 4px',
  },
});

// 行包装扩展
const lineWrappingExtension = EditorView.lineWrapping;

export function CodeEditor(props: CodeEditorProps) {
  const { 
    value, 
    onChange, 
    disabled, 
    onCtrlEnter,
    engine = 'mermaid',
    minHeight = '22rem',
    maxHeight,
    fontSize = 14,
    lineWrapping = true,
    showLineNumbers = true,
  } = props;

  const extensions = useMemo(() => {
    const ext: any[] = [
      editorTheme,
      indentWithTab,
    ];
    
    // 添加语法高亮
    const langExt = getLanguageExtension(engine);
    if (langExt.length > 0) {
      ext.push(...langExt);
    }
    
    // 行包装
    if (lineWrapping) {
      ext.push(lineWrappingExtension);
    }
    
    // 快捷键
    if (onCtrlEnter) {
      ext.push(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onCtrlEnter();
              return true;
            },
          },
          {
            key: 'Mod-s',
            run: () => {
              // 阻止浏览器默认保存行为
              return true;
            },
          },
        ]),
      );
    }
    
    return ext;
  }, [onCtrlEnter, engine, lineWrapping]);

  const handleChange = useCallback((val: string) => {
    onChange(val);
  }, [onChange]);

  return (
    <div 
      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 shadow-inner overflow-hidden"
      style={{ 
        minHeight,
        maxHeight: maxHeight || undefined,
      }}
    >
      <CodeMirror
        value={value}
        editable={!disabled}
        basicSetup={{
          lineNumbers: showLineNumbers,
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
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: false,
          lintKeymap: false,
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

export default CodeEditor;
