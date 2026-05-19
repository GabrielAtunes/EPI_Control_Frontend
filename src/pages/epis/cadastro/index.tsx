import { useState, useEffect, useMemo } from "react";
import { api } from "../../../services/api/api";
import { useToast } from "../../../contexts/ToastContext";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Button } from "../../../components/ui/Button";
import { Collapsible } from "../../../components/ui/Collapsible";
import { Table, type Column } from "../../../components/ui/Table";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import {
  Plus,
  HardHat,
  Package,
  Search,
  Eye,
  Edit2,
  Trash2,
  Filter,
} from "lucide-react";
import { EpiModal } from "./modals/EpiModal";

// --- COMPONENTE DE CARD EXPANDIDO ---
const StatCard = ({ title, value, icon, gradient }: any) => (
  <div className="flex-1 min-w-55 bg-[#1c212d] dark:bg-[#1c212d] rounded-xl p-5 border border-gray-800 shadow-sm relative overflow-hidden flex items-center gap-4">
    <div
      className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.08] bg-linear-to-br ${gradient}`}
    />

    <div
      className={`p-3 rounded-lg bg-linear-to-br ${gradient} text-white shadow-inner relative z-10`}
    >
      {icon}
    </div>
    <div className="relative z-10">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      <h3 className="text-3xl font-bold text-white mt-0.5">{value}</h3>
    </div>
  </div>
);

// --- TIPAGENS ---
interface Certificado {
  id: number;
  ca_numero: string;
  validade_ca?: string | null; // 🟢 Adicionamos a validade aqui!
}
interface EpiEstoque {
  id: number;
  qtd_nova: number;
  qtd_usada: number;
}
interface EpiCatalogo {
  id: number;
  certificado_id: number;
  certificado?: Certificado;
  descricao: string;
  fabricante: string;
  tamanho?: string;
  estoque?: EpiEstoque;
}

type ModalMode = "create" | "edit" | "view";

export default function EpiCadastro() {
  const { success, error } = useToast();

  const [epis, setEpis] = useState<EpiCatalogo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [estoqueFilter, setEstoqueFilter] = useState("todos");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: ModalMode;
    data?: any;
  }>({
    isOpen: false,
    mode: "create",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    epi: EpiCatalogo | null;
  }>({
    isOpen: false,
    epi: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEpis = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/epis/");
      setEpis(response.data);
    } catch (err) {
      error("Erro ao carregar a lista de EPIs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEpis();
  }, []);

  // 🟢 Pegamos a data de hoje para comparar a validade
  const hoje = new Date().toISOString().split("T")[0];

  // --- CÁLCULO DOS VALORES PARA OS CARDS ---
  const totalAtivos = epis.length;
  const totalItensNovos = epis.reduce(
    (acc, epi) => acc + (epi.estoque?.qtd_nova || 0),
    0,
  );
  const totalItensUsados = epis.reduce(
    (acc, epi) => acc + (epi.estoque?.qtd_usada || 0),
    0,
  );

  const filteredEpis = useMemo(() => {
    return epis.filter((epi) => {
      // A. Filtro de Texto (CA, Descrição ou Fabricante)
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        epi.certificado?.ca_numero.toLowerCase().includes(term) ||
        epi.descricao.toLowerCase().includes(term) ||
        epi.fabricante.toLowerCase().includes(term);

      // B. Filtro de Status de Estoque
      const totalEstoque =
        (epi.estoque?.qtd_nova || 0) + (epi.estoque?.qtd_usada || 0);
      let matchesEstoque = true;
      if (estoqueFilter === "com_estoque") matchesEstoque = totalEstoque > 0;
      if (estoqueFilter === "sem_estoque") matchesEstoque = totalEstoque === 0;

      // Retorna apenas se passar em ambos os filtros
      return matchesSearch && matchesEstoque;
    });
  }, [epis, searchTerm, estoqueFilter]);

  const handleSaveEpi = async (formData: any) => {
    setIsSaving(true);
    try {
      if (modalState.mode === "create") {
        await api.post("/epis/", formData);
        success("EPI cadastrado com sucesso!");
      } else {
        await api.patch(`/epis/${modalState.data.id}`, formData);
        success("EPI atualizado com sucesso!");
      }
      setModalState({ ...modalState, isOpen: false });
      fetchEpis();
    } catch (err: any) {
      error(err.response?.data?.detail || "Erro ao salvar o EPI.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEpi = async () => {
    if (!confirmDelete.epi) return;
    setIsDeleting(true);
    try {
      await api.delete(`/epis/${confirmDelete.epi.id}`);
      success("EPI inativado com sucesso.");
      setConfirmDelete({ isOpen: false, epi: null });
      fetchEpis();
    } catch (err) {
      error("Erro ao remover o EPI.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- COLUNAS DA TABELA ---
  const columns: Column<EpiCatalogo>[] = [
    {
      key: "certificado_id",
      header: "Nº do CA",
      render: (epi) => (
        <span className="font-semibold text-gray-200">
          {epi.certificado?.ca_numero || "S/ CA"}
        </span>
      ),
    },
    {
      key: "validade_ca" as keyof EpiCatalogo, // 🟢 NOVA COLUNA: Validade do CA
      header: "Validade do CA",
      render: (epi) => {
        const validade = epi.certificado?.validade_ca;
        if (!validade)
          return <span className="text-gray-500">Não informada</span>;

        const isVencido = validade < hoje;
        const dateObj = new Date(validade + "T00:00:00");
        const dataFormatada = dateObj.toLocaleDateString("pt-BR");

        return (
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
              isVencido
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {dataFormatada} {isVencido && "(Vencido)"}
          </span>
        );
      },
    },
    { key: "descricao", header: "Descrição" },
    { key: "fabricante", header: "Fabricante" },
    {
      key: "novos" as keyof EpiCatalogo,
      header: "Qtd. Novos",
      render: (epi) => (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {epi.estoque?.qtd_nova || 0} UN
        </span>
      ),
    },
    {
      key: "usados" as keyof EpiCatalogo,
      header: "Qtd. Usados",
      render: (epi) => (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {epi.estoque?.qtd_usada || 0} UN
        </span>
      ),
    },
    {
      key: "id",
      // 🟢 Ações perfeitamente alinhadas à direita
      header: (
        <div className="text-right w-full pr-2">Ações</div>
      ) as unknown as string,
      render: (epi) => (
        <div className="flex items-center justify-end gap-1 w-full pr-2">
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "view", data: epi })
            }
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "edit", data: epi })
            }
            className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete({ isOpen: true, epi })}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            title="Inativar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageLayout
        title="Catálogo de EPIs"
        cards={
          <div className="flex flex-col sm:flex-row w-full items-center gap-4">
            <StatCard
              title="Modelos Ativos"
              value={totalAtivos}
              icon={<HardHat className="w-6 h-6" />}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Itens Novos"
              value={totalItensNovos}
              icon={<Package className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              title="Itens Usados"
              value={totalItensUsados}
              icon={<Package className="w-6 h-6" />}
              gradient="from-amber-500 to-orange-600"
            />
          </div>
        }
        actionButton={
          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setModalState({ isOpen: true, mode: "create" })}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg transition-all"
          >
            Novo EPI
          </Button>
        }
        filters={
          <Collapsible title="Filtros e Pesquisa" defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Campo de Busca Multiuso */}
              <div className="relative md:col-span-2 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Pesquisar por CA, Descrição ou Fabricante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#13161f] border border-gray-800 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none text-gray-200 placeholder-gray-600 shadow-inner hover:border-gray-700"
                />
              </div>

              {/* 2. Filtro Rápido de Estoque */}
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <select
                  value={estoqueFilter}
                  onChange={(e) => setEstoqueFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-[#13161f] border border-gray-800 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none text-gray-200 appearance-none shadow-inner cursor-pointer hover:border-gray-700"
                >
                  <option value="todos">Todos os Estoques</option>
                  <option value="com_estoque">Com Estoque Disponível</option>
                  <option value="sem_estoque">Sem Estoque (Zerados)</option>
                </select>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </Collapsible>
        }
      >
        <div className="bg-[#151921] dark:bg-[#151921] rounded-2xl border border-gray-800 shadow-sm overflow-hidden mt-2">
          <Table
            data={filteredEpis}
            columns={columns}
            emptyMessage={
              isLoading ? "Carregando..." : "Nenhum EPI encontrado."
            }
          />
        </div>
      </PageLayout>

      <EpiModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.data}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleSaveEpi}
        isLoading={isSaving}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, epi: null })}
        onConfirm={handleDeleteEpi}
        isLoading={isDeleting}
        title="Inativar Equipamento"
        type="danger"
        confirmText="Sim, inativar"
        message={
          <>
            Deseja inativar o EPI{" "}
            <strong>{confirmDelete.epi?.descricao}</strong>? Ele não aparecerá
            mais no catálogo ativo.
          </>
        }
      />
    </>
  );
}
