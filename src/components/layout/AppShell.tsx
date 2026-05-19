import { useState, type ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { ToastProvider } from "../../contexts/ToastContext"; // 🟢 Importação do Provider de notificações

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);

  return (
    <ThemeProvider>
      <ToastProvider>
        {" "}
        {/* 🟢 Envolvendo a aplicação para permitir o uso de useToast() em qualquer página */}
        <div className="flex h-screen overflow-hidden bg-brand-light dark:bg-brand-dark">
          {/* Container da Sidebar */}
          <div
            className={`
            md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40
            fixed inset-y-0 left-0 transform ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            <Sidebar isCollapsed={isDesktopSidebarCollapsed} />
          </div>

          {/* Overlay do Mobile */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <Header
              onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
              onDesktopToggleClick={() =>
                setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)
              }
              isDesktopCollapsed={isDesktopSidebarCollapsed}
            />

            {/* Conteúdo Principal */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 text-text-primary-light dark:text-text-primary-dark">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
