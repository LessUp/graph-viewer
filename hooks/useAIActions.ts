import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { SidebarTab } from '@/components/SidebarTabs';

type AIActionsDeps = {
  code: string;
  combinedError: string;
  analyzeCode: (code: string) => void;
  fixCode: (code: string, error?: string) => Promise<string | null>;
  generateCode: (description: string) => Promise<string | null>;
  setCode: (code: string) => void;
  setSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export function useAIActions(deps: AIActionsDeps) {
  const {
    code, combinedError,
    analyzeCode, fixCode, generateCode,
    setCode, setSidebarTab, showToast,
  } = deps;

  const handleAIAnalyze = useCallback(() => {
    if (!code.trim()) return;
    analyzeCode(code);
  }, [code, analyzeCode]);

  const handleAIFix = useCallback(async () => {
    if (!code.trim()) return;
    const fixed = await fixCode(code, combinedError || undefined);
    if (fixed) {
      setCode(fixed);
      showToast('AI 已修复代码', 'success');
    }
  }, [code, combinedError, fixCode, setCode, showToast]);

  const handleAIGenerate = useCallback(async (description: string) => {
    const generated = await generateCode(description);
    if (generated) {
      setCode(generated);
      setSidebarTab('editor');
      showToast('代码已生成', 'success');
    }
  }, [generateCode, setCode, setSidebarTab, showToast]);

  const handleAIApplyCode = useCallback((newCode: string) => {
    setCode(newCode);
    setSidebarTab('editor');
    showToast('已应用修改', 'success');
  }, [setCode, setSidebarTab, showToast]);

  return {
    handleAIAnalyze,
    handleAIFix,
    handleAIGenerate,
    handleAIApplyCode,
  };
}
