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
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { UsuarioModal } from "./modals/UsuarioModal";

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

interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
}

type ModalMode = "create" | "edit" | "view";

export default function Usuarios() {
  const { success, error } = useToast();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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
    user: Usuario | null;
  }>({
    isOpen: false,
    user: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      // Trazemos ativos e inativos para popular a tabela e os cards corretamente
      const response = await api.get("/usuarios/?ativos=false");
      setUsuarios(response.data);
    } catch (err) {
      error("Erro ao carregar a lista de Usuários.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // --- CÁLCULOS DOS CARDS ---
  const total = usuarios.length;
  const ativos = usuarios.filter((u) => u.ativo).length;
  const inativos = usuarios.filter((u) => !u.ativo).length;

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuarios;
    const term = searchTerm.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  }, [usuarios, searchTerm]);

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      if (modalState.mode === "create") {
        await api.post("/usuarios/", formData);
        success("Usuário cadastrado com sucesso!");
      } else {
        await api.patch(`/usuarios/${modalState.data.id}`, formData);
        success("Usuário atualizado com sucesso!");
      }
      setModalState({ ...modalState, isOpen: false });
      fetchUsuarios();
    } catch (err: any) {
      error(err.response?.data?.detail || "Erro ao salvar o usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.user) return;
    setIsDeleting(true);
    try {
      await api.delete(`/usuarios/${confirmDelete.user.id}`);
      success("Usuário inativado com sucesso.");
      setConfirmDelete({ isOpen: false, user: null });
      fetchUsuarios();
    } catch (err) {
      error("Erro ao inativar o usuário.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Usuario>[] = [
    {
      key: "nome",
      header: "Nome do Usuário",
      render: (u) => (
        <span className="font-semibold text-gray-200">{u.nome}</span>
      ),
    },
    {
      key: "email",
      header: "E-mail de Acesso",
      render: (u) => <span className="text-gray-300">{u.email}</span>,
    },
    {
      key: "ativo",
      header: "Status",
      render: (u) => (
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
            u.ativo
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-gray-500/10 text-gray-400 border-gray-500/20"
          }`}
        >
          {u.ativo ? "Ativo" : "Bloqueado"}
        </span>
      ),
    },
    {
      key: "id",
      // Alinhamento perfeito à direita sem erro de TS
      header: (
        <div className="text-right w-full pr-2">Ações</div>
      ) as unknown as string,
      render: (u) => (
        <div className="flex items-center justify-end gap-1 w-full pr-2">
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "view", data: u })
            }
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "edit", data: u })
            }
            className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete({ isOpen: true, user: u })}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            title="Inativar/Bloquear Acesso"
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
        title="Usuários do Sistema"
        cards={
          <div className="flex flex-col sm:flex-row w-full items-center gap-4">
            <StatCard
              title="Total de Contas"
              value={total}
              icon={<Users className="w-6 h-6" />}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Liberados"
              value={ativos}
              icon={<UserCheck className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              title="Bloqueados"
              value={inativos}
              icon={<UserX className="w-6 h-6" />}
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
            Novo Usuário
          </Button>
        }
        filters={
          <Collapsible title="Filtros e Pesquisa" defaultOpen>
            <div className="relative max-w-2xl group w-full xl:w-1/2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar por Nome ou E-mail..."
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
            data={filteredUsuarios}
            columns={columns}
            emptyMessage={
              isLoading
                ? "Carregando Usuários..."
                : "Nenhum usuário encontrado."
            }
          />
        </div>
      </PageLayout>

      <UsuarioModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.data}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleSave}
        isLoading={isSaving}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, user: null })}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Bloquear Acesso"
        type="danger"
        confirmText="Sim, bloquear"
        message={
          <>
            Deseja bloquear o acesso do usuário{" "}
            <strong className="text-gray-200">
              {confirmDelete.user?.nome}
            </strong>
            ? Ele não conseguirá mais entrar no sistema.
          </>
        }
      />
    </>
  );
}
