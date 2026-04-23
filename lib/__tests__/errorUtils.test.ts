import { describe, it, expect } from 'vitest';
import { getErrorMessage, isAbortError, isNetworkError } from '../errorUtils';

describe('errorUtils', () => {
  describe('getErrorMessage', () => {
    it('extracts message from Error instance', () => {
      const error = new Error('test error message');
      expect(getErrorMessage(error)).toBe('test error message');
    });

    it('returns fallback for Error with empty message', () => {
      const error = new Error('');
      expect(getErrorMessage(error, 'fallback')).toBe('fallback');
    });

    it('returns string error directly', () => {
      expect(getErrorMessage('string error')).toBe('string error');
    });

    it('returns fallback for non-Error values', () => {
      expect(getErrorMessage(null, 'fallback')).toBe('fallback');
      expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
      expect(getErrorMessage({ foo: 'bar' }, 'fallback')).toBe('fallback');
    });

    it('uses default fallback when not provided', () => {
      expect(getErrorMessage(null)).toBe('Unknown error');
    });
  });

  describe('isAbortError', () => {
    it('returns true for AbortError', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      expect(isAbortError(error)).toBe(true);
    });

    it('returns false for regular Error', () => {
      const error = new Error('regular error');
      expect(isAbortError(error)).toBe(false);
    });

    it('returns false for non-Error values', () => {
      expect(isAbortError('string')).toBe(false);
      expect(isAbortError(null)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('returns true for network-related errors', () => {
      expect(isNetworkError(new Error('network failed'))).toBe(true);
      expect(isNetworkError(new Error('fetch error'))).toBe(true);
      expect(isNetworkError(new Error('timeout exceeded'))).toBe(true);
      expect(isNetworkError(new Error('request aborted'))).toBe(true);
    });

    it('returns false for non-network errors', () => {
      expect(isNetworkError(new Error('syntax error'))).toBe(false);
      expect(isNetworkError(new Error('invalid input'))).toBe(false);
    });

    it('returns false for non-Error values', () => {
      expect(isNetworkError('string')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
    });
  });
});
