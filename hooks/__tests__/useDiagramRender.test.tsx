import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDiagramRender } from '@/hooks/useDiagramRender';

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async () => ({ svg: '<svg>local</svg>' })),
  },
}));

describe('useDiagramRender', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('uses local rendering for svg mermaid diagrams', async () => {
    const { result } = renderHook(() => useDiagramRender('mermaid', 'svg', 'graph TD\nA-->B'));

    await act(async () => {
      await result.current.renderDiagram();
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.svg).toBe('<svg>local</svg>');
    expect(result.current.showPreview).toBe(true);
  });

  it('falls back to remote rendering for non-local formats', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ contentType: 'image/png', base64: 'abc123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { result } = renderHook(() => useDiagramRender('mermaid', 'png', 'graph TD\nA-->B'));

    await act(async () => {
      await result.current.renderDiagram();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.base64).toBe('abc123');
    expect(result.current.contentType).toBe('image/png');
  });

  it('reports a clear error when remote rendering is disabled in static mode', async () => {
    const { result } = renderHook(() =>
      useDiagramRender('plantuml', 'png', '@startuml\nAlice -> Bob\n@enduml', undefined, false),
    );

    await act(async () => {
      await result.current.renderDiagram();
    });

    expect(result.current.error).toContain('静态部署模式');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('clears outputs when resetOutput is called', async () => {
    const { result } = renderHook(() => useDiagramRender('mermaid', 'svg', 'graph TD\nA-->B'));

    await act(async () => {
      await result.current.renderDiagram();
    });

    expect(result.current.svg).toBe('<svg>local</svg>');

    act(() => {
      result.current.resetOutput();
    });

    await waitFor(() => {
      expect(result.current.svg).toBe('');
      expect(result.current.base64).toBe('');
    });
  });
});
