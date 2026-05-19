import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface ComboboxOption {
  value: string | number;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção...",
  label,
  error,
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-left 
            outline-none focus:outline-none focus:ring-1 focus:shadow-none
            bg-white dark:bg-[#13161f] 
            text-text-primary-light dark:text-gray-200
            ${
              isOpen
                ? "border-gray-400 dark:border-gray-500 ring-1 ring-gray-400 dark:ring-gray-500"
                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
            }
            ${
              disabled
                ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50"
                : "cursor-pointer"
            }
            ${error ? "border-red-500 dark:border-red-500" : ""}
          `}
        >
          <span
            className={`block truncate ${!selectedOption ? "text-gray-400 dark:text-gray-500" : ""}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 overflow-hidden bg-white dark:bg-[#1e2533] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#13161f] border border-transparent rounded-lg text-text-primary-light dark:text-gray-200 outline-none focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  placeholder="Filtrar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
                      ${
                        value === option.value
                          ? "bg-gray-100 dark:bg-[#2a3040] text-gray-900 dark:text-white font-semibold"
                          : "text-text-primary-light dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                      }
                    `}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && <Check className="w-4 h-4" />}
                  </li>
                ))
              ) : (
                <li className="px-4 py-8 text-sm text-center text-gray-400">
                  Nenhum resultado encontrado.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
    </div>
  );
}
