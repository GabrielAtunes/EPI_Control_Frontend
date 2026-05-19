import type { ReactNode } from "react";

interface CardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
}

export function Card({ title, value, icon, description }: CardProps) {
  return (
    <div className="bg-white dark:bg-brand-dark-subtle border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 shadow-sm flex flex-col gap-2 min-w-200px flex-1">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {title}
        </span>
        {icon && <div className="text-blue-600 dark:text-blue-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
        {value}
      </div>
      {description && (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {description}
        </p>
      )}
    </div>
  );
}
