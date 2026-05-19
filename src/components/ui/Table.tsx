import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";

// Tipagem genérica para a coluna
export interface Column<T> {
  key: Extract<keyof T, string>;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}

export function Table<T>({
  data,
  columns,
  emptyMessage = "Nenhum registro encontrado.",
}: TableProps<T>) {
  // Configurações de Paginação
  const itemsPerPageOptions = [10, 25, 50, 100, 500, 1000, 2500, 5000];
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  // Configurações de Ordenação
  const [sortConfig, setSortConfig] = useState<{
    key: Extract<keyof T, string>;
    direction: "asc" | "desc";
  } | null>(null);

  // Sincroniza o input digitável com a página atual
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Lógica de Ordenação
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Cálculos de Paginação
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedData.length);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Handlers de Ordenação
  const handleSort = (key: Extract<keyof T, string>, isSortable?: boolean) => {
    if (!isSortable) return;
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Volta para a primeira página ao reordenar
  };

  // Handlers de Paginação
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInput(value);

    const pageNumber = parseInt(value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePageInputBlur = () => {
    const pageNumber = parseInt(pageInput, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      setCurrentPage(1);
    } else if (pageNumber > totalPages) {
      setCurrentPage(totalPages);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-brand-dark-subtle rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm overflow-hidden flex flex-col">
      {/* Container da Tabela com Scroll Horizontal */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider whitespace-nowrap select-none
                    ${col.sortable ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && (
                      <div className="flex flex-col opacity-50">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 opacity-100" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 opacity-100" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={`${rowIndex}-${col.key}`}
                      className="px-6 py-4 text-sm text-text-primary-light dark:text-text-primary-dark whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(item)
                        : String(item[col.key] || "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer de Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 dark:bg-black/20 border-t border-gray-200 dark:border-gray-700/50">
        {/* Esquerda: Info e Controles de Página */}
        <div className="flex items-center gap-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <span className="whitespace-nowrap">
            Mostrando{" "}
            <strong className="text-text-primary-light dark:text-text-primary-dark">
              {data.length === 0 ? 0 : startIndex + 1}
            </strong>{" "}
            a{" "}
            <strong className="text-text-primary-light dark:text-text-primary-dark">
              {endIndex}
            </strong>{" "}
            de{" "}
            <strong className="text-text-primary-light dark:text-text-primary-dark">
              {data.length}
            </strong>
          </span>

          <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              <span>Página</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                className="w-14 text-center py-1 bg-white dark:bg-brand-dark border border-gray-300 dark:border-gray-600 rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hide-arrows"
              />
              <span>de {totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Direita: Itens por página */}
        <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <span>Itens por página:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reseta a página ao mudar a quantidade
            }}
            className="py-1 pl-2 pr-8 bg-white dark:bg-brand-dark border border-gray-300 dark:border-gray-600 rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {itemsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estilo para esconder as setinhas feias padrão do input type="number" nos navegadores webkit */}
      <style>{`
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
