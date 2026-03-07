import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppHeader } from '@/components/AppHeader';

function createJsonFile(text: string) {
  const file = new File(['placeholder'], 'workspace.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', {
    value: vi.fn().mockResolvedValue(text),
  });
  return file;
}

function renderHeader() {
  const onImportWorkspace = vi.fn();
  const onExportWorkspace = vi.fn();
  const onOpenSettings = vi.fn();
  const onError = vi.fn();

  const view = render(
    <AppHeader
      onImportWorkspace={onImportWorkspace}
      onExportWorkspace={onExportWorkspace}
      onOpenSettings={onOpenSettings}
      onError={onError}
    />,
  );

  return {
    ...view,
    onImportWorkspace,
    onExportWorkspace,
    onOpenSettings,
    onError,
  };
}

describe('AppHeader', () => {
  it('triggers export and settings actions from the toolbar', () => {
    const { onExportWorkspace, onOpenSettings } = renderHeader();

    fireEvent.click(screen.getByRole('button', { name: '导出工作区' }));
    fireEvent.click(screen.getByTitle('设置'));

    expect(onExportWorkspace).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('imports a valid workspace json file', async () => {
    const { container, onImportWorkspace, onError } = renderHeader();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const workspace = {
      diagrams: [
        {
          id: 'd-1',
          name: '图 1',
          engine: 'mermaid',
          format: 'svg',
          code: 'graph TD\nA-->B',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      currentId: 'd-1',
    };
    const file = createJsonFile(JSON.stringify(workspace));

    fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(onImportWorkspace).toHaveBeenCalledWith(workspace);
    });

    expect(onError).not.toHaveBeenCalled();
  });

  it('reports an error when importing an invalid workspace file', async () => {
    const { container, onImportWorkspace, onError } = renderHeader();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createJsonFile('{}');

    fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('导入的文件中不包含有效的图列表。');
    });

    expect(onImportWorkspace).not.toHaveBeenCalled();
  });
});
