import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon, Menu, PanelLeftClose, PanelLeft } from "lucide-react";

interface HeaderProps {
  onMobileMenuClick: () => void;
  onDesktopToggleClick: () => void;
  isDesktopCollapsed: boolean;
}

export function Header({
  onMobileMenuClick,
  onDesktopToggleClick,
  isDesktopCollapsed,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  // UX: Saudação dinâmica e responsiva com o horário
  const hora = new Date().getHours();
  let saudacao = "Boa noite";
  if (hora >= 5 && hora < 12) saudacao = "Bom dia";
  else if (hora >= 12 && hora < 18) saudacao = "Boa tarde";

  return (
    <header className="h-20 flex items-center justify-between px-6 bg-brand-light dark:bg-brand-dark-subtle border-b border-gray-200 dark:border-gray-700/50 z-10 relative">
      {/* Esquerda: Controles da Sidebar */}
      <div className="flex items-center gap-4">
        {/* Botão Mobile */}
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-2 -ml-2 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Botão Desktop (Fica no Header, controlando a sidebar ao lado) */}
        <button
          onClick={onDesktopToggleClick}
          className="hidden md:block p-2 -ml-2 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          title={isDesktopCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isDesktopCollapsed ? (
            <PanelLeft className="w-6 h-6" />
          ) : (
            <PanelLeftClose className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Centro: Título */}
      <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
        <h1 className="text-xl md:text-2xl font-bold text-text-primary-light dark:text-text-primary-dark tracking-wide">
          Visão Geral
        </h1>
      </div>

      {/* Direita: Theme Toggle, Avatar e Texto (Nessa ordem) */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 text-text-secondary-light dark:text-text-secondary-dark transition-colors"
          title={theme === "light" ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Separador visual */}
        <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          {/* Avatar primeiro */}
          <div className="w-10 h-10 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold shadow-sm group-hover:opacity-90 transition-opacity">
            GA
          </div>
          {/* Texto de saudação e nome totalmente à direita */}
          <div className="hidden sm:block leading-tight text-left">
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {saudacao},
            </p>
            <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark group-hover:text-brand-accent transition-colors">
              Gabriel Antunes.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
