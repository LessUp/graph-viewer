/**
 * MockStorageAdapter 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockStorageAdapter } from '../adapters/MockStorageAdapter';

describe('MockStorageAdapter', () => {
  let storage: MockStorageAdapter;

  beforeEach(() => {
    storage = new MockStorageAdapter();
  });

  describe('load', () => {
    it('should return default value when key not exists', () => {
      const result = storage.load('nonexistent', { foo: 'bar' });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ foo: 'bar' });
      }
    });

    it('should load saved value correctly', () => {
      const data = { name: 'test', count: 42 };
      const saveResult = storage.save('test-key', data);
      expect(saveResult.ok).toBe(true);

      const loadResult = storage.load('test-key', {});
      expect(loadResult.ok).toBe(true);
      if (loadResult.ok) {
        expect(loadResult.value).toEqual(data);
      }
    });

    it('should return default value on JSON parse error', () => {
      // 直接设置无效 JSON
      storage.setRaw('invalid', 'not valid json {{{');

      const result = storage.load('invalid', { default: true });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ default: true });
      }
    });
  });

  describe('save', () => {
    it('should save primitive values', () => {
      expect(storage.save('string', 'hello').ok).toBe(true);
      expect(storage.save('number', 123).ok).toBe(true);
      expect(storage.save('boolean', true).ok).toBe(true);
      expect(storage.save('null', null).ok).toBe(true);
    });

    it('should save complex objects', () => {
      const data = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3],
        date: '2024-01-01',
      };
      expect(storage.save('complex', data).ok).toBe(true);

      const result = storage.load('complex', {});
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(data);
      }
    });

    it('should return error when quota exceeded', () => {
      storage.setQuotaExceeded(true);

      const result = storage.save('test', 'value');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('QUOTA_EXCEEDED');
        expect(result.error.message).toBe('Simulated quota exceeded');
      }
    });
  });

  describe('remove', () => {
    it('should remove existing key', () => {
      storage.save('to-remove', 'value');
      expect(storage.exists('to-remove')).toBe(true);

      const result = storage.remove('to-remove');
      expect(result.ok).toBe(true);
      expect(storage.exists('to-remove')).toBe(false);
    });

    it('should succeed when key not exists', () => {
      const result = storage.remove('nonexistent');
      expect(result.ok).toBe(true);
    });
  });

  describe('migrate', () => {
    it('should return false when legacy key not exists', () => {
      const result = storage.migrate('old-key', 'new-key');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(false);
      }
    });

    it('should migrate data to new key', () => {
      storage.save('legacy-key', { data: 'test' });

      const result = storage.migrate('legacy-key', 'new-key');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(true);
      }

      // 验证数据已迁移
      expect(storage.exists('legacy-key')).toBe(false);
      const loadResult = storage.load('new-key', {});
      expect(loadResult.ok).toBe(true);
      if (loadResult.ok) {
        expect(loadResult.value).toEqual({ data: 'test' });
      }
    });

    it('should delete legacy key when new key exists', () => {
      storage.save('legacy', 'old-data');
      storage.save('new', 'new-data');

      const result = storage.migrate('legacy', 'new');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(true);
      }

      // 旧数据应被删除
      expect(storage.exists('legacy')).toBe(false);
      // 新数据应保持不变
      const loadResult = storage.load('new', '');
      expect(loadResult.ok).toBe(true);
      if (loadResult.ok) {
        expect(loadResult.value).toBe('new-data');
      }
    });
  });

  describe('exists', () => {
    it('should return false for nonexistent key', () => {
      expect(storage.exists('nonexistent')).toBe(false);
    });

    it('should return true for existing key', () => {
      storage.save('exists', 'value');
      expect(storage.exists('exists')).toBe(true);
    });
  });

  describe('keys', () => {
    it('should return empty array when no keys', () => {
      expect(storage.keys()).toEqual([]);
    });

    it('should return all keys', () => {
      storage.save('key1', 'value1');
      storage.save('key2', 'value2');
      storage.save('key3', 'value3');

      const keys = storage.keys();
      expect(keys.sort()).toEqual(['key1', 'key2', 'key3']);
    });
  });

  describe('access log', () => {
    it('should record access log', () => {
      storage.save('key1', 'value1');
      storage.load('key1', '');
      storage.remove('key1');

      const log = storage.getAccessLog();
      expect(log).toHaveLength(3);
      expect(log[0]?.op).toBe('save');
      expect(log[0]?.key).toBe('key1');
      expect(log[1]?.op).toBe('load');
      expect(log[2]?.op).toBe('remove');
    });

    it('should clear access log', () => {
      storage.save('key', 'value');
      expect(storage.getAccessLog()).toHaveLength(1);

      storage.clearAccessLog();
      expect(storage.getAccessLog()).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should clear all data and log', () => {
      storage.save('key1', 'value1');
      storage.save('key2', 'value2');
      storage.load('key1', '');

      storage.clear();

      expect(storage.exists('key1')).toBe(false);
      expect(storage.exists('key2')).toBe(false);
      expect(storage.getAccessLog()).toHaveLength(0);
    });
  });

  describe('keyPrefix', () => {
    it('should use key prefix', () => {
      const prefixedStorage = new MockStorageAdapter({ keyPrefix: 'app' });

      prefixedStorage.save('key', 'value');
      expect(prefixedStorage.exists('key')).toBe(true);

      // getRaw 也应用了 keyPrefix
      expect(prefixedStorage.getRaw('key')).toBe('"value"');
    });

    it('should isolate keys with different prefixes', () => {
      const storage1 = new MockStorageAdapter({ keyPrefix: 'app1' });
      const storage2 = new MockStorageAdapter({ keyPrefix: 'app2' });

      storage1.save('key', 'value1');
      storage2.save('key', 'value2');

      const result1 = storage1.load('key', '');
      const result2 = storage2.load('key', '');
      expect(result1.ok ? result1.value : null).toBe('value1');
      expect(result2.ok ? result2.value : null).toBe('value2');
    });

    it('should list keys without prefix', () => {
      const prefixedStorage = new MockStorageAdapter({ keyPrefix: 'app' });

      prefixedStorage.save('key1', 'value1');
      prefixedStorage.save('key2', 'value2');

      const keys = prefixedStorage.keys();
      expect(keys.sort()).toEqual(['key1', 'key2']);
    });
  });
});
