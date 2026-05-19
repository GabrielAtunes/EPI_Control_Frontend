import React, { type InputHTMLAttributes } from "react";

// Estende as propriedades padrão de um input HTML e adiciona a prop de ícone
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className = "", ...props }: InputProps) {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <div className="absolute left-3 text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={`
          w-full bg-white dark:bg-brand-dark 
          border border-gray-200 dark:border-gray-700 
          rounded-lg px-4 py-2 text-sm 
          text-text-primary-light dark:text-text-primary-dark 
          focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent 
          transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500
          ${icon ? "pl-10" : ""} 
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
