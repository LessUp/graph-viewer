'use client';

import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { keymap } from '@codemirror/view';

export type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onCtrlEnter?: () => void;
};

export function CodeEditor(props: CodeEditorProps) {
  const { value, onChange, disabled, onCtrlEnter } = props;

  const extensions = useMemo(() => {
    const ext: any[] = [];
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
        ]),
      );
    }
    return ext;
  }, [onCtrlEnter]);

  return (
    <div className="min-h-[22rem] w-full rounded-2xl border border-slate-200 bg-slate-50/60 shadow-inner">
      <CodeMirror
        value={value}
        editable={!disabled}
        basicSetup
        theme="light"
        height="auto"
        onChange={(val) => onChange(val)}
        extensions={extensions}
      />
    </div>
  );
}

export default CodeEditor;
