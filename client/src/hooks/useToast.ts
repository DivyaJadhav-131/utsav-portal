import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'success' | 'destructive';

interface ToastState {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

let toastCount = 0;
let globalDispatch: ((toast: ToastState) => void) | null = null;

export const toast = (opts: {
  title: string;
  description?: string;
  variant?: ToastVariant;
}) => {
  if (globalDispatch) {
    globalDispatch({ id: ++toastCount, variant: 'default', ...opts });
  }
};

export const useToastState = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const dispatch = useCallback((t: ToastState) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 4000);
  }, []);

  // Register global dispatcher
  globalDispatch = dispatch;

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { toasts, dismiss };
};
