import { createContext, useCallback, useContext, useRef, useState } from 'react';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
  action?: { label: string; onPress: () => void };
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const counterRef = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      const id = String(++counterRef.current);
      const duration = toast.duration ?? 4000;

      setToasts((prev) => [...prev, { ...toast, id }]);

      setTimeout(() => {
        dismissToast(id);
      }, duration);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
