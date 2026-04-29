import { beforeEach, describe, expect, it } from 'vitest';
import {
  deleteInflightRender,
  getCachedRender,
  getInflightRender,
  keyOfRender,
  pruneRenderCache,
  resetRenderCacheForTests,
  setCachedRender,
  setInflightRender,
  type RenderCacheEntry,
} from './renderCache';

describe('renderCache', () => {
  beforeEach(() => {
    resetRenderCacheForTests();
  });

  it('uses stable keys that include base url, engine, format and source code', () => {
    const first = keyOfRender('https://kroki.io', 'mermaid', 'svg', 'graph TD\nA-->B');
    const second = keyOfRender('https://kroki.io', 'mermaid', 'svg', 'graph TD\nA-->B');
    const changedCode = keyOfRender('https://kroki.io', 'mermaid', 'svg', 'graph TD\nA-->C');

    expect(first).toBe(second);
    expect(first).not.toBe(changedCode);
  });

  it('prunes expired cached render entries explicitly', () => {
    const fresh: RenderCacheEntry = { expires: 2000, contentType: 'image/svg+xml', svg: '<svg />' };
    const expired: RenderCacheEntry = {
      expires: 500,
      contentType: 'image/svg+xml',
      svg: '<svg />',
    };

    setCachedRender('fresh', fresh);
    setCachedRender('expired', expired);
    pruneRenderCache(1000);

    expect(getCachedRender('fresh')).toBe(fresh);
    expect(getCachedRender('expired')).toBeUndefined();
  });

  it('tracks and clears inflight render tasks by key', async () => {
    const task = Promise.resolve({
      buffer: Buffer.from('ok'),
      cacheEntry: { expires: 2000, contentType: 'image/svg+xml', svg: '<svg />' },
    });

    setInflightRender('same-request', task);
    expect(getInflightRender('same-request')).toBe(task);

    deleteInflightRender('same-request');
    expect(getInflightRender('same-request')).toBeUndefined();
    await expect(task).resolves.toMatchObject({ cacheEntry: { svg: '<svg />' } });
  });
});
