'use client';

import { useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type ToastState = {
  message: string;
  type: ToastType;
} | null;

export function useToast(duration = 2000) {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      setToast({ message, type });
      timerRef.current = window.setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, duration);
    },
    [duration],
  );

  const dismissToast = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  return { toast, showToast, dismissToast };
}
