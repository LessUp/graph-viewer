import { describe, expect, it } from 'vitest';
import {
  ENGINES,
  FORMATS,
  ENGINE_LABELS,
  FORMAT_LABELS,
  isEngine,
  isFormat,
  getKrokiType,
  canUseLocalRender,
} from '@/lib/diagramConfig';

describe('diagramConfig', () => {
  it('keeps engine and format labels aligned with their definitions', () => {
    expect(ENGINES.every((engine) => Boolean(ENGINE_LABELS[engine]))).toBe(true);
    expect(FORMATS.every((format) => Boolean(FORMAT_LABELS[format]))).toBe(true);
  });

  it('validates engines and formats correctly', () => {
    expect(isEngine('mermaid')).toBe(true);
    expect(isEngine('graphviz')).toBe(true);
    expect(isEngine('unknown-engine')).toBe(false);

    expect(isFormat('svg')).toBe(true);
    expect(isFormat('png')).toBe(true);
    expect(isFormat('jpg')).toBe(false);
  });

  it('returns the correct kroki type mapping', () => {
    expect(getKrokiType('mermaid')).toBe('mermaid');
    expect(getKrokiType('graphviz')).toBe('graphviz');
    expect(getKrokiType('flowchart')).toBe('mermaid');
  });

  it('only allows local render for supported svg combinations', () => {
    expect(canUseLocalRender('mermaid', 'svg')).toBe(true);
    expect(canUseLocalRender('graphviz', 'svg')).toBe(true);
    expect(canUseLocalRender('mermaid', 'png')).toBe(false);
    expect(canUseLocalRender('plantuml', 'svg')).toBe(false);
  });
});
