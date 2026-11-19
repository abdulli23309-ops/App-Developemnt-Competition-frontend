import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from './Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    // Avoid exact duplicate toasts within short period
    setToasts((prev) => {
      const isDuplicate = prev.some(
        (t) => t.type === type && t.message === message && t.title === title
      );
      if (isDuplicate) return prev;

      toastIdRef.current += 1;
      const id = toastIdRef.current;
      const newToast = { id, type, title, message, duration };

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      // Keep at most 5 toasts visible at once
      return [...prev.slice(-4), newToast];
    });
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success', duration = 4000) => {
      addToast({ type: 'success', title, message, duration });
    },
    error: (message, title = 'Error', duration = 5000) => {
      addToast({ type: 'error', title, message, duration });
    },
    warning: (message, title = 'Warning', duration = 4500) => {
      addToast({ type: 'warning', title, message, duration });
    },
    info: (message, title = 'Information', duration = 4000) => {
      addToast({ type: 'info', title, message, duration });
    },
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="cc-toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            type={t.type}
            title={t.title}
            message={t.message}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      success: (msg) => console.log('[Toast Success]:', msg),
      error: (msg) => console.error('[Toast Error]:', msg),
      warning: (msg) => console.warn('[Toast Warning]:', msg),
      info: (msg) => console.info('[Toast Info]:', msg),
      dismiss: () => {},
    };
  }
  return context;
}

export default ToastContext;
