import { Calendar, ChevronDown } from "lucide-react";

export type DateFilterType = "dia" | "periodo";

interface DateFilterProps {
  label?: string;
  type: DateFilterType;
  onTypeChange: (type: DateFilterType) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateFilter({
  label,
  type,
  onTypeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateFilterProps) {
  // Classes padronizadas
  const inputClasses = `
    w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-200
    bg-[#13161f] border-gray-800
    text-gray-200 text-sm outline-none
    focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 focus:shadow-none
    disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-900/50
    hover:border-gray-700
  `;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-400 ml-1">
          {label}
        </label>
      )}

      {/* Grid de 3 colunas base */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {/* 1. Seletor de Tipo (Ocupa 1 coluna) */}
        <div className="relative group sm:col-span-1">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gray-300 transition-colors pointer-events-none" />
          <select
            value={type}
            onChange={(e) => {
              onTypeChange(e.target.value as DateFilterType);
              // Limpa a data final se mudar para o modo "dia"
              if (e.target.value === "dia") onEndDateChange("");
            }}
            className={`${inputClasses} appearance-none cursor-pointer`}
          >
            <option value="periodo">Por Período</option>
            <option value="dia">Dia Específico</option>
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* 2. Data Inicial - Expande dinamicamente para 2 colunas se for modo "dia" */}
        <div
          className={`relative group transition-all duration-300 ${type === "dia" ? "sm:col-span-2" : "sm:col-span-1"}`}
        >
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={inputClasses}
            title={type === "periodo" ? "Data Inicial" : "Selecione a Data"}
          />
        </div>

        {/* 3. Data Final - Só é renderizada no modo "periodo" (Ocupa 1 coluna) */}
        {type === "periodo" && (
          <div className="relative group sm:col-span-1 animate-in fade-in zoom-in-95 duration-200">
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className={inputClasses}
              title="Data Final"
            />
          </div>
        )}
      </div>
    </div>
  );
}
