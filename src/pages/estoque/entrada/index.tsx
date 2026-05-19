import { useState, useEffect, useMemo } from "react";
import { api } from "../../../services/api/api";
import { useToast } from "../../../contexts/ToastContext";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Button } from "../../../components/ui/Button";
import { Collapsible } from "../../../components/ui/Collapsible";
import { Table, type Column } from "../../../components/ui/Table";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import {
  DateFilter,
  type DateFilterType,
} from "../../../components/ui/DateFilter";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  FileText,
  DollarSign,
  XCircle,
} from "lucide-react";
import { NfModal } from "./modals/NfModal";

// --- COMPONENTE DE CARD ---
const StatCard = ({ title, value, icon, gradient }: any) => (
  <div className="flex-1 min-w-[240px] bg-[#1c212d] rounded-xl p-5 border border-gray-800 shadow-sm relative overflow-hidden flex items-center gap-4">
    {/* BACKGROUND */}
    <div
      className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.08] bg-linear-to-br ${gradient}`}
    />

    {/* ICON */}
    <div
      className={`p-3 rounded-lg bg-linear-to-br ${gradient} text-white shadow-inner relative z-10 shrink-0`}
    >
      {icon}
    </div>

    {/* TEXT */}
    <div className="relative z-10 flex flex-col flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </p>

      <h3
        className="
          font-bold text-white mt-0.5
          text-xl sm:text-2xl /* <-- Fonte menor para caber os valores */
          leading-40px /* <-- Mantém a altura exata que o texto antigo tinha para o card não encolher */
          tabular-nums
          whitespace-nowrap
        "
      >
        {value}
      </h3>
    </div>
  </div>
);

interface NfEntrada {
  id: number;
  fornecedor_id: number;
  numero_nf: string;
  data_emissao: string;
  valor_total: number;
  ativo: boolean;
  itens?: any[];
}

export default function EstoqueEntrada() {
  const { success, error } = useToast();

  const [nfs, setNfs] = useState<NfEntrada[]>([]);
  const [fornecedoresMap, setFornecedoresMap] = useState<
    Record<number, string>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilterType, setDateFilterType] =
    useState<DateFilterType>("periodo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "view";
    data?: any;
  }>({
    isOpen: false,
    mode: "create",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    nf: NfEntrada | null;
  }>({
    isOpen: false,
    nf: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Traz as NFs (ativas e canceladas) e os fornecedores para mapear os nomes
      const [resNf, resForn] = await Promise.all([
        api.get("/entradas/?ativos=false"),
        api.get("/fornecedores/?ativos=false"),
      ]);
      setNfs(resNf.data);

      const map: Record<number, string> = {};
      resForn.data.forEach((f: any) => {
        map[f.id] = f.nome_fantasia;
      });
      setFornecedoresMap(map);
    } catch (err) {
      error("Erro ao carregar a lista de Entradas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CÁLCULOS DOS CARDS ---
  const nfsAtivas = nfs.filter((nf) => nf.ativo);
  const totalNotas = nfsAtivas.length;
  const valorTotal = nfsAtivas.reduce(
    (acc, nf) => acc + Number(nf.valor_total),
    0,
  );
  const totalCanceladas = nfs.filter((nf) => !nf.ativo).length;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const filteredNfs = useMemo(() => {
    return nfs.filter((nf) => {
      const term = searchTerm.toLowerCase();
      const fornName = fornecedoresMap[nf.fornecedor_id]?.toLowerCase() || "";
      const matchesSearch =
        !searchTerm ||
        nf.numero_nf.toLowerCase().includes(term) ||
        fornName.includes(term);

      let matchesDate = true;
      if (startDate || endDate) {
        if (dateFilterType === "dia" && startDate) {
          matchesDate = nf.data_emissao === startDate;
        } else if (dateFilterType === "periodo") {
          if (startDate && endDate)
            matchesDate =
              nf.data_emissao >= startDate && nf.data_emissao <= endDate;
          else if (startDate) matchesDate = nf.data_emissao >= startDate;
          else if (endDate) matchesDate = nf.data_emissao <= endDate;
        }
      }
      return matchesSearch && matchesDate;
    });
  }, [nfs, searchTerm, dateFilterType, startDate, endDate, fornecedoresMap]);

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      if (modalState.mode === "create") {
        await api.post("/entradas/", formData);
        success("Nota Fiscal registada e stock atualizado com sucesso!");
      }
      setModalState({ ...modalState, isOpen: false });
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.detail || "Erro ao guardar a NF.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.nf) return;
    setIsDeleting(true);
    try {
      await api.delete(`/entradas/${confirmDelete.nf.id}`);
      success("Nota Fiscal cancelada com sucesso.");
      setConfirmDelete({ isOpen: false, nf: null });
      fetchData();
    } catch (err) {
      error("Erro ao cancelar a Nota Fiscal.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<NfEntrada>[] = [
    {
      key: "numero_nf",
      header: "Número NF",
      render: (nf) => (
        <span className="font-bold text-gray-200">#{nf.numero_nf}</span>
      ),
    },
    {
      key: "fornecedor_id",
      header: "Fornecedor",
      render: (nf) => (
        <span className="text-gray-300">
          {fornecedoresMap[nf.fornecedor_id] || "Desconhecido"}
        </span>
      ),
    },
    {
      key: "data_emissao",
      header: "Emissão",
      render: (nf) => {
        const dateObj = new Date(nf.data_emissao + "T00:00:00");
        return (
          <span className="text-gray-400">
            {dateObj.toLocaleDateString("pt-BR")}
          </span>
        );
      },
    },
    {
      key: "valor_total",
      header: "Valor Total",
      render: (nf) => (
        <span className="font-semibold text-emerald-400">
          {formatCurrency(nf.valor_total)}
        </span>
      ),
    },
    {
      key: "ativo",
      header: "Status",
      render: (nf) => (
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
            nf.ativo
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {nf.ativo ? "Lançada" : "Cancelada"}
        </span>
      ),
    },
    {
      key: "id",
      header: (
        <div className="text-right w-full pr-2">Ações</div>
      ) as unknown as string,
      render: (nf) => (
        <div className="flex items-center justify-end gap-1 w-full pr-2">
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "view", data: nf })
            }
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          {nf.ativo && (
            <button
              onClick={() => setConfirmDelete({ isOpen: true, nf })}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              title="Cancelar Nota Fiscal"
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
        title="Entradas (NFs)"
        cards={
          <div className="flex flex-col sm:flex-row w-full items-center gap-4">
            <StatCard
              title="Total NFs"
              value={totalNotas}
              icon={<FileText className="w-6 h-6" />}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Valor Total"
              value={formatCurrency(valorTotal)}
              icon={<DollarSign className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              title="Qtd. Canceladas"
              value={totalCanceladas}
              icon={<XCircle className="w-6 h-6" />}
              gradient="from-red-500 to-rose-600"
            />
          </div>
        }
        actionButton={
          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setModalState({ isOpen: true, mode: "create" })}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg transition-all"
          >
            Nova Entrada
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
                    placeholder="Número da NF ou Fornecedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-[#13161f] border border-gray-800 rounded-xl focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all text-sm outline-none text-gray-200 placeholder-gray-600 shadow-inner hover:border-gray-700"
                  />
                </div>
              </div>

              <div className="w-full xl:w-2/3">
                <DateFilter
                  label="Filtrar por Data de Emissão"
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
            data={filteredNfs}
            columns={columns}
            emptyMessage={
              isLoading ? "A carregar..." : "Nenhuma Nota Fiscal encontrada."
            }
          />
        </div>
      </PageLayout>

      <NfModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.data}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleSave}
        isLoading={isSaving}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, nf: null })}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Cancelar Nota Fiscal"
        type="danger"
        confirmText="Sim, Cancelar NF"
        message={
          <>
            Tem a certeza de que deseja cancelar a NF{" "}
            <strong>#{confirmDelete.nf?.numero_nf}</strong>? Esta ação marcará a
            nota como inativa.
          </>
        }
      />
    </>
  );
}
