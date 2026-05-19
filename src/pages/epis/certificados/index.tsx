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
  Search,
  Eye,
  Edit2,
  Trash2,
  FileText,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { CertificadoModal } from "./modals/CertificadoModal";
import {
  DateFilter,
  type DateFilterType,
} from "../../../components/ui/DateFilter";

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
  validade_ca: string | null;
  ativo: boolean;
}

type ModalMode = "create" | "edit" | "view";

export default function CertificadosAprovacao() {
  const { success, error } = useToast();

  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADOS DOS FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilterType, setDateFilterType] =
    useState<DateFilterType>("periodo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    cert: Certificado | null;
  }>({
    isOpen: false,
    cert: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCertificados = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/certificados/");
      setCertificados(response.data);
    } catch (err) {
      error("Erro ao carregar a lista de Certificados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificados();
  }, []);

  // --- CÁLCULO DOS VALORES PARA OS CARDS ---
  const totalCAs = certificados.length;
  const hoje = new Date().toISOString().split("T")[0];
  const validos = certificados.filter(
    (c) => !c.validade_ca || c.validade_ca >= hoje,
  ).length;
  const vencidos = certificados.filter(
    (c) => c.validade_ca && c.validade_ca < hoje,
  ).length;

  // --- LÓGICA DE FILTRAGEM (Texto + Data Inteligente) ---
  const filteredCertificados = useMemo(() => {
    return certificados.filter((c) => {
      // 1. Filtro por Texto
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm || c.ca_numero.toLowerCase().includes(term);

      // 2. Filtro por Data
      let matchesDate = true;
      // Se startDate ou endDate estiverem preenchidos, aplica a regra de data. Senão, traz tudo.
      if (startDate || endDate) {
        if (!c.validade_ca) {
          matchesDate = false; // Se não tem data no CA e o usuário está filtrando por data, exclui.
        } else {
          if (dateFilterType === "dia" && startDate) {
            matchesDate = c.validade_ca === startDate;
          } else if (dateFilterType === "periodo") {
            if (startDate && endDate)
              matchesDate =
                c.validade_ca >= startDate && c.validade_ca <= endDate;
            else if (startDate) matchesDate = c.validade_ca >= startDate;
            else if (endDate) matchesDate = c.validade_ca <= endDate;
          }
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [certificados, searchTerm, dateFilterType, startDate, endDate]);

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      if (modalState.mode === "create") {
        await api.post("/certificados/", formData);
        success("CA cadastrado com sucesso!");
      } else {
        await api.patch(`/certificados/${modalState.data.id}`, formData);
        success("CA atualizado com sucesso!");
      }
      setModalState({ ...modalState, isOpen: false });
      fetchCertificados();
    } catch (err: any) {
      error(err.response?.data?.detail || "Erro ao salvar o CA.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.cert) return;
    setIsDeleting(true);
    try {
      await api.delete(`/certificados/${confirmDelete.cert.id}`);
      success("CA inativado com sucesso.");
      setConfirmDelete({ isOpen: false, cert: null });
      fetchCertificados();
    } catch (err) {
      error("Erro ao remover o CA. Pode estar em uso por um EPI.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Certificado>[] = [
    {
      key: "ca_numero",
      header: "Número do CA",
      render: (cert) => (
        <span className="font-semibold text-gray-200">{cert.ca_numero}</span>
      ),
    },
    {
      key: "validade_ca",
      header: "Data de Validade",
      render: (cert) => {
        if (!cert.validade_ca)
          return <span className="text-gray-500">Não informada</span>;

        const isVencido = cert.validade_ca < hoje;
        const dateObj = new Date(cert.validade_ca + "T00:00:00");
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
    {
      key: "id",
      // 🚨 TRUQUE TYPESCRIPT: Passamos a div e forçamos o TS a aceitar como string.
      // Isso alinha o título à direita e evita o erro "Type 'Element' is not assignable to type 'string'".
      header: (
        <div className="text-right w-full pr-2">Ações</div>
      ) as unknown as string,
      render: (cert) => (
        <div className="flex items-center justify-end gap-1 w-full pr-2">
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "view", data: cert })
            }
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "edit", data: cert })
            }
            className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete({ isOpen: true, cert })}
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
        title="Cadastro de C.A.s"
        cards={
          <div className="flex flex-col sm:flex-row w-full items-center gap-4">
            <StatCard
              title="CAS Total"
              value={totalCAs}
              icon={<FileText className="w-6 h-6" />}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="CAs Válidos"
              value={validos}
              icon={<ShieldCheck className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              title="CAs Vencidos"
              value={vencidos}
              icon={<ShieldAlert className="w-6 h-6" />}
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
            Novo CA
          </Button>
        }
        filters={
          <Collapsible title="Filtros e Pesquisa" defaultOpen>
            <div className="flex flex-col xl:flex-row gap-4 w-full">
              {/* 1. Pesquisa de Texto */}
              <div className="w-full xl:w-1/3 space-y-1.5">
                <label className="block text-sm font-medium text-gray-400 ml-1">
                  Pesquisar
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                  <input
                    type="text"
                    placeholder="Pesquisar por Número do CA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-[#13161f] border border-gray-800 rounded-xl focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all text-sm outline-none text-gray-200 placeholder-gray-600 shadow-inner hover:border-gray-700"
                  />
                </div>
              </div>

              {/* 2. Componente de Filtro de Data */}
              <div className="w-full xl:w-2/3">
                <DateFilter
                  label="Filtrar por Validade do CA"
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
            data={filteredCertificados}
            columns={columns}
            emptyMessage={
              isLoading
                ? "Carregando CAs..."
                : "Nenhum CA encontrado com os filtros aplicados."
            }
          />
        </div>
      </PageLayout>

      <CertificadoModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.data}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleSave}
        isLoading={isSaving}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, cert: null })}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Inativar Certificado"
        type="danger"
        confirmText="Sim, inativar"
        message={
          <>
            Deseja inativar o CA{" "}
            <strong className="text-gray-200">
              {confirmDelete.cert?.ca_numero}
            </strong>
            ? Isso impedirá que novos EPIs sejam vinculados a ele.
          </>
        }
      />
    </>
  );
}
