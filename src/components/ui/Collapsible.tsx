import { useState, type ReactNode } from "react";
import { ChevronDown, Filter } from "lucide-react";

interface CollapsibleProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Collapsible({
  title = "Filtros de Busca",
  icon = <Filter className="w-4 h-4" />,
  children,
  defaultOpen = false,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-brand-dark-subtle border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Botão Superior (Header) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2 text-text-primary-light dark:text-text-primary-dark font-medium text-sm">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Corpo expansível */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-1000px opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 border-t border-gray-200 dark:border-gray-700/50 bg-gray-50/30 dark:bg-black/10">
          {children}
        </div>
      </div>
    </div>
  );
}
