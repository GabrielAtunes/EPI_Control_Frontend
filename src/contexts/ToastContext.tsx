import React, { createContext, useContext, useState, useCallback } from "react";
// O import abaixo vai buscar o componente visual que já está lá na sua pasta UI
import { Toast, type ToastType } from "../components/ui/Toast";

interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextData {
  toast: (
    type: ToastType,
    message: string,
    title?: string,
    duration?: number,
  ) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration?: number) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((state) => [...state, { id, type, message, title, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success: (msg, title) => addToast("success", msg, title),
        error: (msg, title) => addToast("error", msg, title),
        warning: (msg, title) => addToast("warning", msg, title),
        info: (msg, title) => addToast("info", msg, title),
      }}
    >
      {children}

      {/* Container Fixo na tela para exibir os Toasts empilhados */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context;
}
