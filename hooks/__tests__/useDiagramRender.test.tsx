import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDiagramRender } from '@/hooks/useDiagramRender';

const fetchMock = vi.fn();
const mermaidRenderMock = vi.fn(async () => ({ svg: '<svg>local</svg>' }));
const graphvizLoadMock = vi.fn(async () => undefined);
const graphvizLayoutMock = vi.fn(async () => '<svg>graphviz</svg>');

vi.stubGlobal('fetch', fetchMock);

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: mermaidRenderMock,
  },
}));

vi.mock('@hpcc-js/wasm', () => ({
  graphviz: {
    wasmFolder: vi.fn(),
    load: graphvizLoadMock,
    layout: graphvizLayoutMock,
  },
}));

describe('useDiagramRender', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mermaidRenderMock.mockClear();
    graphvizLoadMock.mockClear();
    graphvizLayoutMock.mockClear();
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

  it('uses local graphviz rendering for svg diagrams', async () => {
    const { result } = renderHook(() => useDiagramRender('graphviz', 'svg', 'digraph G { A -> B }'));

    await act(async () => {
      await result.current.renderDiagram();
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(graphvizLayoutMock).toHaveBeenCalled();
    expect(result.current.svg).toBe('<svg>graphviz</svg>');
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

  it('reports remote render errors with a user-friendly message', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 'KROKI_ERROR', status: 400, details: 'syntax error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { result } = renderHook(() => useDiagramRender('plantuml', 'png', '@startuml\nAlice -> Bob\n@enduml'));

    await act(async () => {
      await result.current.renderDiagram();
    });

    expect(result.current.error).toContain('远程渲染服务渲染失败');
    expect(result.current.error).toContain('HTTP 502 / Kroki 400');
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

  it('downloads remote binary output', async () => {
    const createObjectURL = vi.fn(() => 'blob:download');
    const revokeObjectURL = vi.fn();
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    anchor.click = click;
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return anchor;
      }
      return originalCreateElement(tagName);
    });

    fetchMock.mockResolvedValueOnce(
      new Response(new Blob(['pngdata'], { type: 'image/png' }), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      }),
    );

    const { result } = renderHook(() => useDiagramRender('plantuml', 'png', '@startuml\nA->B\n@enduml'));

    await act(async () => {
      await result.current.downloadDiagram();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);

    createElementSpy.mockRestore();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

});
