import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api/api";
import { useToast } from "../../contexts/ToastContext";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { Collapsible } from "../../components/ui/Collapsible";
import { Table, type Column } from "../../components/ui/Table";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { FornecedorModal } from "./modals/FornecedorModal";

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

interface Fornecedor {
  id: number;
  nome_fantasia: string;
  cnpj: string;
  email: string | null;
  ativo: boolean;
}

type ModalMode = "create" | "edit" | "view";

export default function Fornecedores() {
  const { success, error } = useToast();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    forn: Fornecedor | null;
  }>({
    isOpen: false,
    forn: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFornecedores = async () => {
    setIsLoading(true);
    try {
      // Passamos ativos=false para trazer todos (ativos e inativos)
      const response = await api.get("/fornecedores/?ativos=false");
      setFornecedores(response.data);
    } catch (err) {
      error("Erro ao carregar a lista de Fornecedores.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, []);

  // --- CÁLCULOS DOS CARDS ---
  const total = fornecedores.length;
  const ativos = fornecedores.filter((f) => f.ativo).length;
  const inativos = fornecedores.filter((f) => !f.ativo).length;

  const filteredFornecedores = useMemo(() => {
    if (!searchTerm) return fornecedores;
    const term = searchTerm.toLowerCase();
    return fornecedores.filter(
      (f) =>
        f.nome_fantasia.toLowerCase().includes(term) ||
        f.cnpj.includes(term) ||
        (f.email && f.email.toLowerCase().includes(term)),
    );
  }, [fornecedores, searchTerm]);

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      if (modalState.mode === "create") {
        await api.post("/fornecedores/", formData);
        success("Fornecedor cadastrado com sucesso!");
      } else {
        await api.patch(`/fornecedores/${modalState.data.id}`, formData);
        success("Fornecedor atualizado com sucesso!");
      }
      setModalState({ ...modalState, isOpen: false });
      fetchFornecedores();
    } catch (err: any) {
      error(err.response?.data?.detail || "Erro ao salvar o fornecedor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.forn) return;
    setIsDeleting(true);
    try {
      await api.delete(`/fornecedores/${confirmDelete.forn.id}`);
      success("Fornecedor inativado com sucesso.");
      setConfirmDelete({ isOpen: false, forn: null });
      fetchFornecedores();
    } catch (err) {
      error("Erro ao inativar o fornecedor.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Fornecedor>[] = [
    {
      key: "nome_fantasia",
      header: "Nome Fantasia",
      render: (forn) => (
        <span className="font-semibold text-gray-200">
          {forn.nome_fantasia}
        </span>
      ),
    },
    { key: "cnpj", header: "CNPJ" },
    {
      key: "email",
      header: "E-mail",
      render: (forn) => (
        <span className="text-gray-300">{forn.email || "—"}</span>
      ),
    },
    {
      key: "ativo",
      header: "Status",
      render: (forn) => (
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
            forn.ativo
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-gray-500/10 text-gray-400 border-gray-500/20"
          }`}
        >
          {forn.ativo ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "id",
      // Ações totalmente à direita (Truque do TypeScript)
      header: (
        <div className="text-right w-full pr-2">Ações</div>
      ) as unknown as string,
      render: (forn) => (
        <div className="flex items-center justify-end gap-1 w-full pr-2">
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "view", data: forn })
            }
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "edit", data: forn })
            }
            className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete({ isOpen: true, forn })}
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
        title="Fornecedores"
        cards={
          <div className="flex flex-col sm:flex-row w-full items-center gap-4">
            <StatCard
              title="Total"
              value={total}
              icon={<Building2 className="w-6 h-6" />}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Ativos"
              value={ativos}
              icon={<CheckCircle className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              title="Inativos"
              value={inativos}
              icon={<XCircle className="w-6 h-6" />}
              gradient="from-gray-500 to-slate-600"
            />
          </div>
        }
        actionButton={
          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setModalState({ isOpen: true, mode: "create" })}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg transition-all"
          >
            Novo Fornecedor
          </Button>
        }
        filters={
          <Collapsible title="Filtros e Pesquisa" defaultOpen>
            <div className="relative max-w-2xl group w-full xl:w-1/2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar por Nome Fantasia, CNPJ ou E-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-[#13161f] border border-gray-800 rounded-xl focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all text-sm outline-none text-gray-200 placeholder-gray-600 shadow-inner hover:border-gray-700"
              />
            </div>
          </Collapsible>
        }
      >
        <div className="bg-[#151921] dark:bg-[#151921] rounded-2xl border border-gray-800 shadow-sm overflow-hidden mt-2">
          <Table
            data={filteredFornecedores}
            columns={columns}
            emptyMessage={
              isLoading
                ? "Carregando Fornecedores..."
                : "Nenhum fornecedor encontrado."
            }
          />
        </div>
      </PageLayout>

      <FornecedorModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.data}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleSave}
        isLoading={isSaving}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, forn: null })}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Inativar Fornecedor"
        type="danger"
        confirmText="Sim, inativar"
        message={
          <>
            Deseja inativar o fornecedor{" "}
            <strong className="text-gray-200">
              {confirmDelete.forn?.nome_fantasia}
            </strong>
            ? Ele não aparecerá em novos lançamentos de estoque.
          </>
        }
      />
    </>
  );
}
