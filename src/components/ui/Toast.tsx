import React, { createContext, useContext, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const variantConfig = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[#ECFDF5] border-[#A7F3D0]',
    icon_color: 'text-[#059669]',
    text: 'text-[#065F46]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[#FEF2F2] border-[#FECACA]',
    icon_color: 'text-[#DC2626]',
    text: 'text-[#991B1B]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#EFF6FF] border-[#BFDBFE]',
    icon_color: 'text-[#2563EB]',
    text: 'text-[#1E40AF]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#FFFBEB] border-[#FDE68A]',
    icon_color: 'text-[#D97706]',
    text: 'text-[#92400E]',
  },
};

let toastId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 4000) => {
      const id = `toast_${++toastId}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const contextValue: ToastContextType = {
    showToast,
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
    warning: (msg) => showToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-[100] flex flex-col gap-2 w-[calc(100%-32px)] md:w-full md:max-w-sm pointer-events-none"
          aria-live="polite"
        >
          <AnimatePresence>
            {toasts.map((toast) => {
              const config = variantConfig[toast.variant];
              const Icon = config.icon;

              return (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto',
                    config.bg
                  )}
                  role="alert"
                >
                  <Icon size={18} className={cn('flex-shrink-0 mt-0.5', config.icon_color)} />
                  <p className={cn('flex-1 text-sm font-medium leading-snug', config.text)}>
                    {toast.message}
                  </p>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className={cn('flex-shrink-0 transition-opacity hover:opacity-70 p-0.5 -mr-1', config.icon_color)}
                    aria-label="Dismiss notification"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
