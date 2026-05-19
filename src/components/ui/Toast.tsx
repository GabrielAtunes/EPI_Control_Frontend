import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles: Record<
  ToastType,
  { icon: React.ReactNode; progressBg: string }
> = {
  success: {
    icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
    progressBg: "bg-emerald-500",
  },
  error: {
    icon: <XCircle className="w-6 h-6 text-red-500" />,
    progressBg: "bg-red-500",
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    progressBg: "bg-amber-500",
  },
  info: {
    icon: <Info className="w-6 h-6 text-blue-500" />,
    progressBg: "bg-blue-500",
  },
};

export function Toast({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);
  const { icon, progressBg } = toastStyles[type];

  // Controla o fechamento automático e a animação de saída
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    // Aguarda a animação de saída terminar antes de remover do DOM
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`relative w-80 overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-brand-dark-subtle pointer-events-auto transition-all duration-300 transform
        ${isClosing ? "opacity-0 translate-x-full scale-95" : "opacity-100 translate-x-0 scale-100"}
      `}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Ícone */}
        <div className="shrink-0 mt-0.5">{icon}</div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-snug">
            {message}
          </p>
        </div>

        {/* Botão de Fechar */}
        <button
          onClick={handleClose}
          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de Progresso Animada */}
      <div className="h-1 w-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full ${progressBg}`}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        />
      </div>

      {/* Estilo local para a animação da barra (shrink) */}
      <style>{`
        @keyframes toast-progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
