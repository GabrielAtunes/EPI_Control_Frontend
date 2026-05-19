import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";

// Importação das suas páginas
import Dashboard from "../pages/dashboard";
import EpiCadastro from "../pages/epis/cadastro";
import EpiVencimentos from "../pages/epis/vencimentos";
import EstoqueEntrada from "../pages/estoque/entrada";
import Fornecedor from "../pages/fornecedor";
import Alocacoes from "../pages/alocacoes";
import Colaboradores from "../pages/colaboradores";
import Usuarios from "../pages/usuarios";
import Relatorios from "../pages/relatorios";
import CertificadosAprovacao from "../pages/epis/certificados";

export function AppRoutes() {
  return (
    // 🟢 Limpo: O AppShell e as Routes agora usam o roteador do topo (main.tsx)
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* EPIs */}
        <Route path="/epis/cadastro" element={<EpiCadastro />} />
        <Route path="/epis/certificados" element={<CertificadosAprovacao />} />
        <Route path="/epis/vencimentos" element={<EpiVencimentos />} />

        {/* Estoque */}
        <Route path="/estoque/entrada" element={<EstoqueEntrada />} />

        {/* Outros */}
        <Route path="/fornecedor" element={<Fornecedor />} />
        <Route path="/alocacoes" element={<Alocacoes />} />
        <Route path="/colaboradores" element={<Colaboradores />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/relatorios" element={<Relatorios />} />

        {/* Redirecionamento padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
