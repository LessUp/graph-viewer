import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PreviewPanel } from '@/components/PreviewPanel';

vi.mock('@/components/PreviewToolbar', () => ({
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
