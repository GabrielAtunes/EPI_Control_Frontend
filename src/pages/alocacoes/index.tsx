import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api/api";
import { useToast } from "../../contexts/ToastContext";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { Collapsible } from "../../components/ui/Collapsible";
import { Table, type Column } from "../../components/ui/Table";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import {
  DateFilter,
  type DateFilterType,
} from "../../components/ui/DateFilter";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  ClipboardCheck,
  ArrowDownCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { AlocacaoModal } from "./modals/AlocacaoModal";

// --- TIPAGENS ALINHADAS COM O BACKEND ---

interface AlocacaoItem {
  id: number;
  epi_catalogo_id: number;
  qtd: number;
  estado_entrega: string;
  data_devolucao: string | null;
  motivo_devolucao: string | null;
  retornou_estoque: boolean | null;
}

interface Alocacao {
  id: number;
  colaborador_id: number;
  ativo: boolean;
  data_alocacao: string;
  itens: AlocacaoItem[];
}

// Estrutura plana para facilitar a renderização na tabela
interface AlocacaoRow {
  alocacao_id: number;
  item_id: number;
  colaborador_id: number;
  epi_catalogo_id: number;
  qtd: number;
  estado_entrega: string;
  data_alocacao: string;
  data_devolucao: string | null;
  ativo: boolean;
  motivo_devolucao?: string | null;
  retornou_estoque?: boolean | null;
}

interface ColaboradorResponse {
  id: number;
  nome: string;
}

interface EpiResponse {
  id: number;
  descricao: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}

interface AlocacaoFormData {
  colaborador_id?: string;
  epi_catalogo_id?: string;
  qtd?: string | number;
  estado_entrega?: string;
  data_devolucao?: string;
  motivo_devolucao?: string;
  retornou_estoque?: boolean;
}

type ModalMode = "create" | "edit" | "view";

// --- COMPONENTE DE CARD EXPANDIDO ---
const StatCard = ({ title, value, icon, gradient }: StatCardProps) => (
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

export default function Alocacoes() {
  const { success, error } = useToast();

  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [colaboradoresMap, setColaboradoresMap] = useState<
    Record<number, string>
  >({});
  const [episMap, setEpisMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilterType, setDateFilterType] =
    useState<DateFilterType>("periodo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: ModalMode;
    data?: AlocacaoRow;
  }>({
    isOpen: false,
    mode: "create",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    alocacao: AlocacaoRow | null;
  }>({
    isOpen: false,
    alocacao: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Trazemos alocações, colaboradores e epis de forma paralela
      const [resAloc, resColab, resEpis] = await Promise.all([
        api.get<Alocacao[]>("/alocacoes/?ativos=false"),
        api.get<ColaboradorResponse[]>("/colaboradores/?ativos=false"),
        api.get<EpiResponse[]>("/epis/"),
      ]);

      setAlocacoes(resAloc.data);

      const colabMap: Record<number, string> = {};
      resColab.data.forEach((c) => {
        colabMap[c.id] = c.nome;
      });
      setColaboradoresMap(colabMap);

      const epiMap: Record<number, string> = {};
      resEpis.data.forEach((e) => {
        epiMap[e.id] = e.descricao;
      });
      setEpisMap(epiMap);
    } catch (err) {
      error("Erro ao carregar a lista de Alocações.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transforma as alocações (Capa -> Itens) em linhas planas para a Tabela
  const flattenedRows = useMemo(() => {
    const rows: AlocacaoRow[] = [];
    alocacoes.forEach((aloc) => {
      aloc.itens.forEach((item) => {
        rows.push({
          alocacao_id: aloc.id,
          item_id: item.id,
          colaborador_id: aloc.colaborador_id,
          epi_catalogo_id: item.epi_catalogo_id,
          qtd: item.qtd,
          estado_entrega: item.estado_entrega,
          data_alocacao: aloc.data_alocacao,
          data_devolucao: item.data_devolucao,
          ativo: aloc.ativo,
          motivo_devolucao: item.motivo_devolucao,
          retornou_estoque: item.retornou_estoque,
        });
      });
    });
    return rows;
  }, [alocacoes]);

  // --- CÁLCULOS DOS CARDS ---
  const alocAtivas = flattenedRows.filter((a) => a.ativo);
  const total = alocAtivas.length;
  const pendentes = alocAtivas.filter((a) => !a.data_devolucao).length;
  const devolvidas = alocAtivas.filter((a) => !!a.data_devolucao).length;

  const filteredAlocacoes = useMemo(() => {
    return flattenedRows.filter((a) => {
      const term = searchTerm.toLowerCase();
      const colabName = colaboradoresMap[a.colaborador_id]?.toLowerCase() || "";
      const epiName = episMap[a.epi_catalogo_id]?.toLowerCase() || "";

      const matchesSearch =
        !searchTerm || colabName.includes(term) || epiName.includes(term);

      // Usando a data_alocacao (entrega pai) para o filtro de datas
      const dataIso = a.data_alocacao.split("T")[0];
      let matchesDate = true;

      if (startDate || endDate) {
        if (dateFilterType === "dia" && startDate) {
          matchesDate = dataIso === startDate;
        } else if (dateFilterType === "periodo") {
          if (startDate && endDate)
            matchesDate = dataIso >= startDate && dataIso <= endDate;
          else if (startDate) matchesDate = dataIso >= startDate;
          else if (endDate) matchesDate = dataIso <= endDate;
        }
      }
      return matchesSearch && matchesDate;
    });
  }, [
    flattenedRows,
    searchTerm,
    dateFilterType,
    startDate,
    endDate,
    colaboradoresMap,
    episMap,
  ]);

  const handleSave = async (formData: AlocacaoFormData) => {
    setIsSaving(true);
    try {
      if (modalState.mode === "create") {
        // Moldar o payload para suportar estrutura Capa -> Itens exigida na API (AlocacaoCreate)
        const payload = {
          colaborador_id: Number(formData.colaborador_id),
          itens: [
            {
              epi_catalogo_id: Number(formData.epi_catalogo_id),
              qtd: Number(formData.qtd),
              estado_entrega: formData.estado_entrega,
            },
          ],
        };
        await api.post("/alocacoes/", payload);
        success("Entrega de EPI registrada com sucesso!");
      } else if (modalState.mode === "edit" && modalState.data) {
        // Enviar os dados de devolução usando a rota dedicada aos itens
        await api.patch(
          `/alocacoes/itens/${modalState.data.item_id}/devolucao`,
          formData,
        );
        success("Devolução registrada com sucesso! Estoque atualizado.");
      }
      setModalState({ ...modalState, isOpen: false });
      fetchData();
    } catch (err: unknown) {
      const errResponse = (err as { response?: { data?: { detail?: string } } })
        .response;
      error(
        errResponse?.data?.detail ||
          "Erro ao salvar a alocação. Verifique o saldo de estoque ou os dados.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.alocacao) return;
    setIsDeleting(true);
    try {
      // O Cancelamento deve ser feito sobre a Alocação pai
      await api.delete(`/alocacoes/${confirmDelete.alocacao.alocacao_id}`);
      success("Registro cancelado com sucesso.");
      setConfirmDelete({ isOpen: false, alocacao: null });
      fetchData();
    } catch (err) {
      error("Erro ao cancelar o registro.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<AlocacaoRow>[] = [
    {
      key: "alocacao_id",
      header: "ID Mov.",
      render: (a) => (
        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
          #{String(a.alocacao_id).padStart(5, "0")}
        </span>
      ),
    },
    {
      key: "colaborador_id",
      header: "Colaborador",
      render: (a) => (
        <span className="font-semibold text-gray-200">
          {colaboradoresMap[a.colaborador_id] || "Desconhecido"}
        </span>
      ),
    },
    {
      key: "epi_catalogo_id",
      header: "Equipamento",
      render: (a) => (
        <span className="text-gray-300">
          {episMap[a.epi_catalogo_id] || "Desconhecido"}
        </span>
      ),
    },
    {
      key: "qtd",
      header: "Qtd/Estado",
      render: (a) => (
        <span className="text-gray-400 font-medium">
          {a.qtd} UN ({a.estado_entrega})
        </span>
      ),
    },
    {
      key: "data_alocacao",
      header: "Data de Entrega",
      render: (a) => {
        const dateObj = new Date(a.data_alocacao);
        return (
          <span className="text-gray-400">
            {dateObj.toLocaleDateString("pt-BR")}
          </span>
        );
      },
    },
    {
      key: "data_devolucao",
      header: "Status",
      render: (a) => {
        if (!a.ativo) {
          return (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-red-500/10 text-red-400 border-red-500/20">
              Cancelada
            </span>
          );
        }
        if (a.data_devolucao) {
          return (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Devolvido
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20">
            Em Uso
          </span>
        );
      },
    },
    {
      key: "item_id",
      header: (
        <div className="text-right w-full pr-2">Ações</div>
      ) as unknown as string,
      render: (a) => (
        <div className="flex items-center justify-end gap-1 w-full pr-2">
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "view", data: a })
            }
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          {a.ativo && !a.data_devolucao && (
            <button
              onClick={() =>
                setModalState({ isOpen: true, mode: "edit", data: a })
              }
              className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
              title="Registrar Devolução"
            >
              <ArrowDownCircle className="w-4 h-4" />
            </button>
          )}
          {a.ativo && (
            <button
              onClick={() => setConfirmDelete({ isOpen: true, alocacao: a })}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              title="Cancelar Registro"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageLayout
        title="Alocações"
        cards={
          <div className="flex flex-col sm:flex-row w-full items-center gap-4">
            <StatCard
              title="EPIs Total"
              value={total}
              icon={<ClipboardCheck className="w-6 h-6" />}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="EPIs Em Uso"
              value={pendentes}
              icon={<Clock className="w-6 h-6" />}
              gradient="from-amber-500 to-orange-600"
            />
            <StatCard
              title="EPIs Devolvidos"
              value={devolvidas}
              icon={<CheckCircle2 className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-600"
            />
          </div>
        }
        actionButton={
          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setModalState({ isOpen: true, mode: "create" })}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg transition-all"
          >
            Nova Entrega
          </Button>
        }
        filters={
          <Collapsible title="Filtros e Pesquisa" defaultOpen>
            <div className="flex flex-col xl:flex-row gap-4 w-full">
              <div className="w-full xl:w-1/3 space-y-1.5">
                <label className="block text-sm font-medium text-gray-400 ml-1">
                  Pesquisar
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                  <input
                    type="text"
                    placeholder="Colaborador ou EPI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-[#13161f] border border-gray-800 rounded-xl focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all text-sm outline-none text-gray-200 placeholder-gray-600 shadow-inner hover:border-gray-700"
                  />
                </div>
              </div>

              <div className="w-full xl:w-2/3">
                <DateFilter
                  label="Filtrar por Data de Entrega"
                  type={dateFilterType}
                  onTypeChange={setDateFilterType}
                  startDate={startDate}
                  onStartDateChange={setStartDate}
                  endDate={endDate}
                  onEndDateChange={setEndDate}
                />
              </div>
            </div>
          </Collapsible>
        }
      >
        <div className="bg-[#151921] dark:bg-[#151921] rounded-2xl border border-gray-800 shadow-sm overflow-hidden mt-2">
          <Table
            data={filteredAlocacoes}
            columns={columns}
            emptyMessage={
              isLoading ? "A carregar..." : "Nenhuma alocação encontrada."
            }
          />
        </div>
      </PageLayout>

      <AlocacaoModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.data}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleSave}
        isLoading={isSaving}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, alocacao: null })}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Cancelar Registro"
        type="danger"
        confirmText="Sim, Cancelar"
        message={
          <>
            Tem a certeza de que deseja cancelar este registro? Isto tornará a
            entrega inativa no histórico para todos os itens associados.
          </>
        }
      />
    </>
  );
}
