import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PreviewPanel } from './PreviewPanel';

vi.mock('./PreviewToolbar', () => ({
  PreviewToolbar: ({ onZoomIn, onZoomOut, onResetZoom, onFullscreen }: Record<string, () => void>) => (
    <div>
      <button onClick={onZoomIn}>zoom-in</button>
      <button onClick={onZoomOut}>zoom-out</button>
      <button onClick={onResetZoom}>zoom-reset</button>
      <button onClick={onFullscreen}>fullscreen</button>
    </div>
  ),
}));

describe('PreviewPanel', () => {
  it('renders empty state when there is no preview output', () => {
    render(
      <PreviewPanel
        svg=""
        base64=""
        contentType=""
        loading={false}
        showPreview={false}
        format="svg"
      />,
    );

    expect(screen.getByText('预览区域')).toBeInTheDocument();
    expect(screen.getByText('编辑代码后自动渲染')).toBeInTheDocument();
  });

  it('renders png empty-state guidance before output is available', () => {
    render(
      <PreviewPanel
        svg=""
        base64=""
        contentType=""
        loading={false}
        showPreview={false}
        format="png"
      />,
    );

    expect(screen.getByText('渲染成功后会在这里显示 PNG 预览')).toBeInTheDocument();
  });

  it('renders binary preview error state for png failures', () => {
    render(
      <PreviewPanel
        svg=""
        base64=""
        contentType=""
        loading={false}
        showPreview={false}
        format="png"
        error="远程渲染服务超时"
      />,
    );

    expect(screen.getByText('PNG 预览加载失败')).toBeInTheDocument();
    expect(screen.getByText('远程渲染服务超时')).toBeInTheDocument();
    expect(screen.getByText('请检查远程渲染配置，或切换到 SVG 继续预览。')).toBeInTheDocument();
  });

  it('renders binary preview error state for pdf failures', () => {
    render(
      <PreviewPanel
        svg=""
        base64=""
        contentType=""
        loading={false}
        showPreview={false}
        format="pdf"
        error="当前静态部署模式下不可用该渲染方式"
      />,
    );

    expect(screen.getByText('PDF 预览加载失败')).toBeInTheDocument();
    expect(screen.getByText('当前静态部署模式下不可用该渲染方式')).toBeInTheDocument();
    expect(screen.getByText('当前 PDF 预览依赖远程渲染结果，建议检查服务状态后重试。')).toBeInTheDocument();
  });

  it('renders pdf previews', () => {
    render(
      <PreviewPanel
        svg=""
        base64="abc123"
        contentType="application/pdf"
        loading={false}
        showPreview={true}
        format="pdf"
      />,
    );

    expect(screen.getByTitle('diagram preview')).toHaveAttribute('src', 'data:application/pdf;base64,abc123');
  });

  it('renders sanitized svg content and interaction hint', () => {
    const { container } = render(
      <PreviewPanel
        svg="<svg><script>alert(1)</script><text>Hello</text></svg>"
        base64=""
        contentType="image/svg+xml"
        loading={false}
        showPreview={true}
        format="svg"
      />,
    );

    expect(container.querySelector('.diagram-container')).toBeInTheDocument();
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(screen.getByText(/Ctrl\/⌘ \+ 滚轮缩放/)).toBeInTheDocument();
  });

  it('supports zoom controls through the toolbar', () => {
    const { container } = render(
      <PreviewPanel
        svg="<svg><text>Hello</text></svg>"
        base64=""
        contentType="image/svg+xml"
        loading={false}
        showPreview={true}
        format="svg"
      />,
    );

    fireEvent.click(screen.getByText('zoom-in'));
    const zoomContainer = container.querySelector('.diagram-container')?.parentElement as HTMLElement;
    expect(zoomContainer).toHaveStyle({ transform: 'translate(0px, 0px) scale(1.25)' });

    fireEvent.click(screen.getByText('zoom-reset'));
    expect(zoomContainer).toHaveStyle({ transform: 'translate(0px, 0px) scale(1)' });
  });

  it('renders png previews', () => {
    render(
      <PreviewPanel
        svg=""
        base64="abc123"
        contentType="image/png"
        loading={false}
        showPreview={true}
        format="png"
      />,
    );

    expect(screen.getByAltText('diagram preview')).toHaveAttribute(
      'src',
      'data:image/png;base64,abc123',
    );
  });
});
