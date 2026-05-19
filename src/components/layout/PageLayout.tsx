import type { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  cards?: ReactNode; // Espera os componentes <Card />
  actionButton?: ReactNode; // O Botão "Adicionar"
  filters?: ReactNode; // O componente <Collapsible /> com os inputs
  children: ReactNode; // A <Table /> (Tabela de dados)
}

export function PageLayout({
  title,
  cards,
  actionButton,
  filters,
  children,
}: PageLayoutProps) {
  return (
    <div className="flex flex-col gap-6 w-full h-full animate-in fade-in duration-300">
      {/* 1. Header (Wireframe: Título na esquerda, Cards no Centro, Botão na direita) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Título */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark tracking-tight truncate">
            {title}
          </h1>
        </div>

        {/* Cards Centrais */}
        {cards && (
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto lg:flex-1 justify-center">
            {cards}
          </div>
        )}

        {/* Botão de Adicionar */}
        {actionButton && (
          <div className="flex-1 flex justify-start lg:justify-end shrink-0 w-full lg:w-auto">
            {actionButton}
          </div>
        )}
      </div>

      {/* 2. Filtros Colapsáveis */}
      {filters && <div className="w-full">{filters}</div>}

      {/* 3. Tabela de Dados (Conteúdo Principal) */}
      <div className="flex-1 w-full flex flex-col min-h-0">{children}</div>
    </div>
  );
}
