import { useState, useCallback } from 'react';

export interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'info',
    message: '',
  });

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToast({ show: true, type, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast('success', message);
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast('error', message);
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast('info', message);
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
  };
}
