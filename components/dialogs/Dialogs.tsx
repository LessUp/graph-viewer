'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export type ConfirmDialogOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
};

export type PromptDialogOptions = {
  title?: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
};

export type AlertDialogOptions = {
  title?: string;
  message: string;
  buttonText?: string;
};

// 确认对话框
export function ConfirmDialog({
  isOpen,
  options,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  options: ConfirmDialogOptions;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const {
    title = '确认操作',
    message,
    confirmText = '确认',
    cancelText = '取消',
    variant = 'default',
  } = options;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        tabIndex={-1}
      >
        <div className="mb-4 flex items-start gap-3">
          {variant === 'danger' && (
            <div className="rounded-full bg-rose-100 p-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
          )}
          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            <p id="confirm-dialog-description" className="mt-2 text-sm text-slate-600">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
              variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// 输入对话框
export function PromptDialog({
  isOpen,
  options,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  options: PromptDialogOptions;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(options.defaultValue ?? '');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, options.defaultValue]);

  if (!isOpen) return null;

  const {
    title = '请输入',
    message,
    placeholder = '',
    confirmText = '确认',
    cancelText = '取消',
  } = options;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-dialog-title"
        aria-describedby="prompt-dialog-description"
      >
        <div className="mb-4">
          <h3 id="prompt-dialog-title" className="text-base font-semibold text-slate-900">
            {title}
          </h3>
          <p id="prompt-dialog-description" className="mt-2 text-sm text-slate-600">
            {message}
          </p>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            {confirmText}
          </button>
        </div>
      </form>
    </div>
  );
}

// 警告对话框（替代 alert）
export function AlertDialog({
  isOpen,
  options,
  onClose,
}: {
  isOpen: boolean;
  options: AlertDialogOptions;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const { title = '提示', message, buttonText = '确定' } = options;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        tabIndex={-1}
      >
        <div className="mb-4">
          <h3 id="alert-dialog-title" className="text-base font-semibold text-slate-900">
            {title}
          </h3>
          <p id="alert-dialog-description" className="mt-2 text-sm text-slate-600">
            {message}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast 组件
export function Toast({
  message,
  type = 'info',
  onClose,
}: {
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-800';

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg ${bgColor} px-4 py-3 text-sm font-medium text-white shadow-lg`}
    >
      {message}
      <button onClick={onClose} className="ml-2 rounded-full p-0.5 transition hover:bg-white/20">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
