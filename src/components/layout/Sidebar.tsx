import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { authService } from "../../services/auth/authService";
import {
  LayoutDashboard,
  HardHat,
  ClipboardCheck,
  Users,
  UserPlus,
  FileText,
  LogOut,
  Search,
  Package,
  Building2,
} from "lucide-react";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/",
  },
  {
    name: "EPIs",
    icon: <HardHat className="w-5 h-5" />,
    href: "/epis/cadastro",
  },
  {
    name: "Certificados (CA)",
    icon: <FileText className="w-5 h-5" />,
    href: "/epis/certificados",
  },
  {
    name: "Estoque (Entrada)",
    icon: <Package className="w-5 h-5" />,
    href: "/estoque/entrada",
  },
  {
    name: "Fornecedor",
    icon: <Building2 className="w-5 h-5" />,
    href: "/fornecedor",
  },
  {
    name: "Alocações",
    icon: <ClipboardCheck className="w-5 h-5" />,
    href: "/alocacoes",
  },
  {
    name: "Colaboradores",
    icon: <Users className="w-5 h-5" />,
    href: "/colaboradores",
  },
  {
    name: "Usuários",
    icon: <UserPlus className="w-5 h-5" />,
    href: "/usuarios",
  },
  {
    name: "Relatórios",
    icon: <FileText className="w-5 h-5" />,
    href: "/relatorios",
  },
];

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const location = useLocation();
  const [filterText, setFilterText] = useState("");

  const text = filterText.toLowerCase();

  const filteredNav = useMemo(() => {
    return navigation.filter((item) => item.name.toLowerCase().includes(text));
  }, [text]);

  return (
    <aside
      className={`bg-brand-light dark:bg-brand-dark-subtle 
      border-r border-gray-200 dark:border-gray-700/50
      flex flex-col h-screen transition-all duration-300
      ${isCollapsed ? "w-20" : "w-72"}`}
    >
      {/* HEADER */}
      <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-gray-700/50">
        {!isCollapsed ? (
          <span className="font-black text-2xl tracking-tight text-brand-accent">
            EPI
            <span className="text-text-primary-light dark:text-text-primary-dark">
              CONTROL
            </span>
          </span>
        ) : (
          <span className="font-black text-lg text-brand-accent">EPI</span>
        )}
      </div>

      {/* SEARCH */}
      {!isCollapsed && (
        <div className="px-4 py-3">
          <div className="relative group">
            <Search className="absolute left-2 top-2.5 w-4 h-4 opacity-60 group-focus-within:text-brand-accent" />
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-8 pr-2 py-2 text-sm bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-brand-accent transition"
            />
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition
              ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                  : "hover:bg-gray-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {item.icon}
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700/50">
        <button
          onClick={() => authService.logout()}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
