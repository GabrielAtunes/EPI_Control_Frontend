import React, { useEffect } from "react";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertOctagon,
  Loader2,
  X,
} from "lucide-react";

export type ConfirmModalType = "danger" | "warning" | "info" | "success";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmModalType;
  isLoading?: boolean;
}

// Mapeamento dinâmico de cores e ícones baseado no tipo de alerta
const modalStyles: Record<
  ConfirmModalType,
  {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    buttonColor: string;
  }
> = {
  danger: {
    icon: AlertOctagon,
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-500/20",
    buttonColor: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
    buttonColor:
      "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
    buttonColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    buttonColor:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  isLoading = false,
}: ConfirmModalProps) {
  // UX: Fechar o modal ao apertar a tecla "Escape"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  const style = modalStyles[type];
  const Icon = style.icon;

  return (
    // Backdrop com desfoque
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Container do Modal */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Evita que o clique dentro do modal feche ele
      >
        {/* Botão de Fechar Superior Direito */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Ícone Dinâmico */}
            <div
              className={`shrink-0 p-3 rounded-full ${style.iconBg} ${style.iconColor}`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 mt-1">
              <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                {title}
              </h3>
              <div className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {message}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com Botões */}
        <div className="bg-gray-50 dark:bg-black/20 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-200 dark:border-gray-700/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 bg-transparent border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center justify-center px-4 py-2 font-medium rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-brand-dark focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed ${style.buttonColor}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
